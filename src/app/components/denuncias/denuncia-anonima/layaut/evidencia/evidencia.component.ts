import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BotInfoService } from '../../../shared/bot/botInfoDenuncias';
import { FooterComponent } from '../../footer/footer.component';
import { HeaderComponent } from '../../header/header.component';
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

  // New method to initialize camera
  async initCamera() {
    try {
      if (!this.canTakeMorePhotos()) {
        if (this.cameraFileCount >= this.MAX_CAMERA_FILES) {
          this.toastr.error(`Has alcanzado el límite de ${this.MAX_CAMERA_FILES} fotos con la cámara`);
        } else {
          this.toastr.error(`Has alcanzado el límite total de ${this.MAX_TOTAL_FILES} archivos multimedia`);
        }
        return;
      }
      this.showCamera = true;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      // Wait for DOM to update
      setTimeout(() => {
        this.videoElement = document.querySelector('#cameraFeed');
        if (this.videoElement) {
          this.videoElement.srcObject = stream;
          this.videoStream = stream;
        }
      }, 100);

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error accessing camera:', error);
      this.toastr.error('No se pudo acceder a la cámara');
      this.closeCamera();
    }
  }
  // Método modificado para capturar foto con validación
  async capturePhoto() {
    if (this.cameraFileCount >= this.MAX_CAMERA_FILES) {
      this.toastr.error(`Solo puedes tomar un máximo de ${this.MAX_CAMERA_FILES} fotos con la cámara`);
      this.closeCamera();
      return;
    }

    if (this.selectedMultimedia.length >= this.MAX_TOTAL_FILES) {
      this.toastr.error(`Has alcanzado el límite máximo de ${this.MAX_TOTAL_FILES} archivos multimedia`);
      this.closeCamera();
      return;
    }

    if (!this.videoElement) return;

    const canvas = document.createElement('canvas');
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.95);
      });

      const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });

      // Incrementar contador de fotos de cámara
      this.cameraFileCount++;

      // Mantener archivos existentes y agregar el nuevo
      this.selectedMultimedia = [...this.selectedMultimedia, file];

      this.toastr.success('Foto capturada exitosamente');
      this.closeCamera();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error capturing photo:', error);
      this.toastr.error('Error al capturar la foto');
    }
  }

  // Method to close camera
  closeCamera() {
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
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const newFiles = Array.from(input.files);
    const totalNewFiles = newFiles.length;
    const currentTotal = this.selectedMultimedia.length;

    // Validar límite total de archivos
    if (currentTotal + totalNewFiles > this.MAX_TOTAL_FILES) {
      this.toastr.error(`Solo puedes subir un máximo de ${this.MAX_TOTAL_FILES} archivos en total. Actualmente tienes ${currentTotal} archivo(s)`);
      // Limpiar el input para permitir nueva selección
      input.value = '';
      return;
    }

    // Validar que solo sean imágenes o videos
    const invalidFiles = newFiles.filter(file => !this.isImage(file) && !this.isVideo(file));
    if (invalidFiles.length > 0) {
      this.toastr.error('Solo se permiten archivos de imagen o video');
      input.value = '';
      return;
    }

    // Mantener archivos existentes y agregar los nuevos
    this.selectedMultimedia = [...this.selectedMultimedia, ...newFiles];
    this.cdr.detectChanges();

    // Mostrar mensaje de éxito con contador
    this.toastr.success(`Se agregaron ${totalNewFiles} archivo(s). Total: ${this.selectedMultimedia.length} de ${this.MAX_TOTAL_FILES}`);

    // Limpiar el input para permitir nueva selección del mismo archivo
    input.value = '';
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

  // Método para continuar al siguiente paso (solo si la descripción no está vacía)
  handleContinue(): void {
    if (this.descripcion.trim().length === 0) {
      this.toastr.error('Debes ingresar una descripción para continuar');
      return;
    }

    if (this.wordCount < this.minimumWords) {
      this.toastr.error(`La descripción debe contener al menos ${this.minimumWords} palabras`);
      return;
    }

    const multimediaPaths: string[] = [];

    // Guardar los archivos multimedia seleccionados
    this.selectedMultimedia.forEach(file => {
      const uniqueFileName = `${Date.now()}-${file.name}`; // Genera un nombre único usando la marca de tiempo
      const filePath = `uploads/multimedia/${uniqueFileName}`; // Ruta donde se almacenará el archivo
      multimediaPaths.push(filePath);
      // Aquí debes incluir la lógica para subir el archivo al servidor
      // y moverlo a `uploads/multimedia/` o la ruta que desees
    });

    let audioPath: string | undefined;
    if (this.audioBlob) {
      const uniqueAudioName = `${Date.now()}-audio.wav`; // Nombre único para el archivo de audio
      audioPath = `uploads/audio/${uniqueAudioName}`;
      // Aquí deberías subir el blob de audio al servidor, guardándolo en `uploads/audio/`
    }

    // Guardar en el storage
    this.denunciaStorage.setDescripcionPruebas(
      this.descripcion,
      multimediaPaths.length > 0 ? multimediaPaths.join(',') : undefined,
      audioPath
    );

    this.router.navigate(['/ubicacion']);
  }

  // Limpieza de recursos cuando el componente se destruye
  ngOnDestroy() {
    this.clearAudioRecording();
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
    }
    this.closeCamera();

  }
}