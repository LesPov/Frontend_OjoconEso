import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../../../shared/bot/botInfoDenuncias';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { DenunciaStorageService } from '../../service/denunciaStorage.service';

@Component({
  selector: 'app-evidencia',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './evidencia.component.html',
  styleUrls: ['./evidencia.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class EvidenciaComponent implements OnInit {
  subtipoDenuncia: string | null = null;
  currentStep = 1;
  totalSteps = 3;
  selectedMultimedia: File[] = [];
  descripcion: string = '';
  minimumWords: number = 10;
  wordCount: number = 0;
  showError: boolean = false;
  isRecording = false;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  audioUrl: string | null = null;
  maxRecordingTime = 60000;
  recordingTimeout: any;
  audioBlob: Blob | null = null;
  currentStream: MediaStream | null = null;
  showCamera = false;
  videoStream: MediaStream | null = null;
  videoElement: HTMLVideoElement | null = null;
  // Nuevas propiedades para el control de límites

  readonly MAX_TOTAL_FILES = 10;
  readonly MAX_CAMERA_FILES = 5;
  cameraFileCount = 0;
  // Propiedades para modo de captura
  isPhotoMode: boolean = true;
  isRecordingVideo: boolean = false;
  videoRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  videoBlob: Blob | null = null;
  private currentVideoStream: MediaStream | null = null;

  // Nueva lista de mensajes
  private infoEvidenciaList: string[] = [
    "Bienvenido a la sección de evidencia. Aquí podrás subir archivos multimedia relacionados con tu denuncia.",
    "Selecciona una imagen, video o audio que respalde tu denuncia.",
    "Puedes agregar una descripción detallada de la evidencia que estás subiendo.",
    "Si lo prefieres, puedes grabar un mensaje de audio como parte de tu evidencia.",
    "Recuerda que toda la evidencia que proporciones ayudará a mejorar la atención a tu denuncia.",
    "Gracias por subir tu evidencia. Puedes continuar con el siguiente paso cuando estés listo."
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private denunciaStorage: DenunciaStorageService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private botInfoService: BotInfoService


  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.subtipoDenuncia = params['nombreSubTipoDenuncia'];
    });
    // Asignar la nueva lista de mensajes al bot
    this.botInfoService.setInfoList(this.infoEvidenciaList);
  }
  ///////////////////////////////GRABACION//////////////////////////
  // Selección de modo foto o video
  selectMode(mode: string) {
    this.isPhotoMode = mode === 'photo';
  }

  // Alternar grabación de video
  async toggleVideoRecording() {
    if (!this.isRecordingVideo) {
      await this.startVideoRecording();
    } else {
      await this.stopVideoRecording();
    }
    this.cdr.detectChanges();
  }

  // Iniciar grabación de video
  private async startVideoRecording() {
    try {
      // Solicitar permisos para video y audio
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },  // Configuración para cámaras traseras en móviles
        audio: true
      });

      this.currentVideoStream = stream;
      this.videoRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp8,opus'
      });
      this.recordedChunks = [];

      this.videoRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.videoRecorder.onstop = () => {
        this.cleanupVideoStream();

        this.videoBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const videoFile = new File([this.videoBlob], `video-${Date.now()}.webm`, { type: 'video/webm' });
        this.selectedMultimedia.push(videoFile);
        this.toastr.success('Video con audio grabado con éxito');
        this.cdr.detectChanges();
      };

      this.videoRecorder.start();
      this.isRecordingVideo = true;
    } catch (error) {
      this.toastr.error('No se pudo iniciar la grabación de video con audio');
      console.error('Error al iniciar la grabación de video con audio:', error);
      this.cleanupVideoStream();
    }
  }

  // Detener grabación de video
  private async stopVideoRecording() {
    if (this.videoRecorder && this.isRecordingVideo) {
      this.videoRecorder.stop();
      this.isRecordingVideo = false;
      this.closeCamera();

    }
  }

  // Limpiar stream de video
  private cleanupVideoStream() {
    if (this.currentVideoStream) {
      this.currentVideoStream.getTracks().forEach(track => {
        track.stop();
      });
      this.currentVideoStream = null;
    }
  }



  ////////////////////////////////////////////////////////////////////
  async initCamera() {
    try {
      if (!this.checkPhotoLimits()) return;

      this.showCamera = true;
      const stream = await this.startCameraStream();

      this.initializeVideoElement(stream);

      this.cdr.detectChanges();
    } catch (error) {
      this.handleCameraError(error);
    }
  }

  // Validar los límites de fotos antes de abrir la cámara
  private checkPhotoLimits(): boolean {
    if (!this.canTakeMorePhotos()) {
      this.displayLimitError();
      return false;
    }
    return true;
  }

  // Mostrar mensaje de error en caso de superar el límite de fotos
  private displayLimitError() {
    if (this.cameraFileCount >= this.MAX_CAMERA_FILES) {
      this.toastr.error(`Has alcanzado el límite de ${this.MAX_CAMERA_FILES} fotos con la cámara`);
    } else {
      this.toastr.error(`Has alcanzado el límite total de ${this.MAX_TOTAL_FILES} archivos multimedia`);
    }
  }

  // Iniciar el flujo de la cámara
  private async startCameraStream(): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });
  }

  // Inicializar el elemento de video y asignarle el flujo de la cámara
  private initializeVideoElement(stream: MediaStream) {
    setTimeout(() => {
      this.videoElement = document.querySelector('#cameraFeed');
      if (this.videoElement) {
        this.videoElement.srcObject = stream;
        this.videoStream = stream;
      }
    }, 100);
  }

  // Manejar errores al acceder a la cámara
  private handleCameraError(error: any) {
    console.error('Error accessing camera:', error);
    this.toastr.error('No se pudo acceder a la cámara');
    this.closeCamera();
  }

  // Función principal para capturar foto
  async capturePhoto() {
    if (!this.validatePhotoLimits()) return;

    if (!this.videoElement) return;

    try {
      const photoBlob = await this.captureImageFromVideo();
      const photoFile = this.createPhotoFile(photoBlob);

      this.addPhotoToGallery(photoFile);
      this.showSuccessMessage();
      this.closeCamera();
    } catch (error) {
      this.handleCaptureError(error);
    }
  }

  // Validar los límites de archivos
  private validatePhotoLimits(): boolean {
    if (this.cameraFileCount >= this.MAX_CAMERA_FILES) {
      this.toastr.error(`Solo puedes tomar un máximo de ${this.MAX_CAMERA_FILES} fotos con la cámara`);
      this.closeCamera();
      return false;
    }

    if (this.selectedMultimedia.length >= this.MAX_TOTAL_FILES) {
      this.toastr.error(`Has alcanzado el límite máximo de ${this.MAX_TOTAL_FILES} archivos multimedia`);
      this.closeCamera();
      return false;
    }

    return true;
  }

  // Capturar imagen desde el video en un elemento canvas y obtener el blob de la imagen
  private async captureImageFromVideo(): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement!.videoWidth;
    canvas.height = this.videoElement!.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) throw new Error("No se pudo obtener el contexto del canvas");

    context.drawImage(this.videoElement!, 0, 0, canvas.width, canvas.height);

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("No se pudo capturar la imagen"));
      }, 'image/jpeg', 0.95);
    });
  }

  // Crear un archivo de foto a partir de un Blob
  private createPhotoFile(blob: Blob): File {
    return new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
  }

  // Añadir la foto capturada a la galería de multimedia
  private addPhotoToGallery(file: File) {
    this.cameraFileCount++;
    this.selectedMultimedia = [...this.selectedMultimedia, file];
    this.cdr.detectChanges();
  }

  // Mostrar mensaje de éxito
  private showSuccessMessage() {
    this.toastr.success('Foto capturada exitosamente');
  }

  // Manejar el error en la captura de foto
  private handleCaptureError(error: any) {
    console.error('Error capturing photo:', error);
    this.toastr.error('Error al capturar la foto');
  }


  // Modificar el método closeCamera
  closeCamera() {
    // Detener la grabación de video si está activa
    if (this.isRecordingVideo) {
      this.stopVideoRecording();
    }

    // Limpiar el stream de video
    this.cleanupVideoStream();

    // Detener el stream de la cámara
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }

    this.showCamera = false;
    this.videoElement = null;
    this.cdr.detectChanges();
  }


  onDescripcionChange(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.descripcion = input.value;

    // Count words by splitting on whitespace and filtering out empty strings
    const words = this.descripcion.trim().split(/\s+/).filter(word => word.length > 0);
    this.wordCount = words.length;

    // Show error if words are less than minimum and description is not empty
    this.showError = this.descripcion.trim().length > 0 && this.wordCount < this.minimumWords;
  }
  // Método para iniciar/detener la grabación
  async toggleRecording() {
    if (!this.isRecording) {
      // Limpiar grabación anterior si existe
      this.clearAudioRecording();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.currentStream = stream;
        this.startRecording(stream);
      } catch (error) {
        this.toastr.error('No se pudo acceder al micrófono');
        console.error('Error al acceder al micrófono:', error);
      }
    } else {
      await this.stopRecording();
    }
  }

  // Limpiar la grabación actual
  private clearAudioRecording() {
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
    this.audioUrl = null;
    this.audioChunks = [];
    this.cdr.detectChanges(); // Forzar actualización cuando limpiamos
  }


  // Iniciar la grabación

  private startRecording(stream: MediaStream) {
    this.audioChunks = [];
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
    this.isRecording = true;

    // Forzar actualización de la vista
    this.cdr.detectChanges();

    // Detener automáticamente la grabación después de 1 minuto
    setTimeout(() => {
      if (this.isRecording) {
        this.stopRecording();
        this.toastr.info('La grabación ha alcanzado el límite de 1 minuto');
      }
    }, this.maxRecordingTime);
  }

  // Detener la grabación
  private async stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.isRecording = false;

      return new Promise<void>((resolve) => {
        this.mediaRecorder!.onstop = () => {
          this.audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          this.audioUrl = URL.createObjectURL(this.audioBlob);

          // Limpiar el stream
          if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
          }

          // Forzar actualización de la vista
          this.cdr.detectChanges();
          resolve();
        };

        this.mediaRecorder!.stop();
      });
    }
  }
  // Método modificado para la selección de archivos
  // Método para seleccionar archivos
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const newFiles = Array.from(input.files);
    const totalNewFiles = newFiles.length;
    const currentTotal = this.selectedMultimedia.length;

    if (!this.validateTotalFileLimit(totalNewFiles, currentTotal)) {
      input.value = ''; // Limpiar el input
      return;
    }

    if (!this.validateFileTypes(newFiles)) {
      input.value = ''; // Limpiar el input
      return;
    }

    // Añadir archivos nuevos y actualizar la vista
    this.addFilesToGallery(newFiles);
    input.value = ''; // Limpiar el input para permitir nueva selección
  }

  // Validar el límite total de archivos
  private validateTotalFileLimit(totalNewFiles: number, currentTotal: number): boolean {
    if (currentTotal + totalNewFiles > this.MAX_TOTAL_FILES) {
      this.toastr.error(`Solo puedes subir un máximo de ${this.MAX_TOTAL_FILES} archivos en total. Actualmente tienes ${currentTotal} archivo(s).`);
      return false;
    }
    return true;
  }

  // Validar tipos de archivos (solo imágenes o videos)
  private validateFileTypes(files: File[]): boolean {
    const invalidFiles = files.filter(file => !this.isImage(file) && !this.isVideo(file));
    if (invalidFiles.length > 0) {
      this.toastr.error('Solo se permiten archivos de imagen o video');
      return false;
    }
    return true;
  }

  // Agregar archivos a la galería
  private addFilesToGallery(files: File[]) {
    this.selectedMultimedia = [...this.selectedMultimedia, ...files];
    this.cdr.detectChanges();
    this.toastr.success(`Se agregaron ${files.length} archivo(s). Total: ${this.selectedMultimedia.length} de ${this.MAX_TOTAL_FILES}`);
  }

  // Resto de los métodos existentes...
  triggerFileUpload(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }


  // Nuevo método para eliminar archivos individuales
  removeFile(index: number): void {
    // Si el archivo eliminado es una foto de cámara, decrementar el contador
    const file = this.selectedMultimedia[index];
    if (file.name.startsWith('camera-capture-')) {
      this.cameraFileCount--;
    }

    this.selectedMultimedia = this.selectedMultimedia.filter((_, i) => i !== index);
    this.toastr.info(`Archivo eliminado. Total: ${this.selectedMultimedia.length} de ${this.MAX_TOTAL_FILES}`);
    this.cdr.detectChanges();
  }

  // Método para verificar si se puede agregar más archivos
  canAddMoreFiles(): boolean {
    return this.selectedMultimedia.length < this.MAX_TOTAL_FILES;
  }

  // Método para verificar si se pueden tomar más fotos con la cámara
  canTakeMorePhotos(): boolean {
    return this.cameraFileCount < this.MAX_CAMERA_FILES && this.canAddMoreFiles();
  }

  isImage(file: File): boolean {

    return file.type.startsWith('image/');
  }

  isVideo(file: File): boolean {
    return file.type.startsWith('video/');
  }

  getFileUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  handleContinue(): void {
    if (this.descripcion.trim().length === 0) {
      this.toastr.error('Debes ingresar una descripción para continuar');
      return;
    }

    if (this.wordCount < this.minimumWords) {
      this.toastr.error(`La descripción debe contener al menos ${this.minimumWords} palabras`);
      return;
    }

    // Convertir el audioBlob a File si existe
    let audioFiles: File[] = [];
    if (this.audioBlob) {
      const audioFile = new File(
        [this.audioBlob],
        `${Date.now()}-audio.wav`,
        { type: 'audio/wav' }
      );
      audioFiles.push(audioFile);
    }

    // Los archivos multimedia ya están como File objects en selectedMultimedia
    const multimediaFiles = Array.from(this.selectedMultimedia);

    // Guardar en el storage usando los File objects directamente
    this.denunciaStorage.setDescripcionPruebas(
      this.descripcion,
      multimediaFiles,
      audioFiles
    );

    this.router.navigate(['/ubicacion']);
  }


  // Limpieza de recursos cuando el componente se destruye
  ngOnDestroy() {
    this.stopVideoRecording();
    this.cleanupVideoStream();
    this.closeCamera();
    this.clearAudioRecording();

    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }
  }
}