import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

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
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

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
   // New camera-related properties
   isCameraOpen: boolean = false;
   cameraStream: MediaStream | null = null;
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
  
  async toggleCamera() {
    if (this.isCameraOpen) {
      this.closeCamera();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }, 
          audio: false 
        });
        
        this.cameraStream = stream;
        this.isCameraOpen = true;
        
        // Wait for DOM update
        setTimeout(() => {
          if (this.videoElement && this.videoElement.nativeElement) {
            this.videoElement.nativeElement.srcObject = stream;
            this.videoElement.nativeElement.play();
          }
          this.cdr.detectChanges();
        });
        
        this.toastr.success('Cámara activada');
      } catch (error) {
        console.error('Error accessing camera:', error);
        this.toastr.error('No se pudo acceder a la cámara');
      }
    }
  }

  closeCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
    this.isCameraOpen = false;
    this.cdr.detectChanges();
  }

  capturePhoto() {
    if (!this.isCameraOpen || !this.videoElement || !this.canvasElement) {
      return;
    }

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a File object from the blob
          const photoFile = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
          
          // Clear previous photos
          this.selectedMultimedia = [photoFile];
          
          // Close camera after capturing
          this.closeCamera();
          
          this.toastr.success('Foto capturada exitosamente');
          this.cdr.detectChanges();
        }
      }, 'image/jpeg');
    }
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

  // Resto de los métodos existentes...
  triggerFileUpload(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedMultimedia = Array.from(input.files);

      // Usar setTimeout para retrasar el cambio de URL
      setTimeout(() => {
        this.cdr.detectChanges();
      });
    }
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
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
    }
  }
}