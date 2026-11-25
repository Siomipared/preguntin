# Preguntados Web - Edición Definitiva (SPA Offline)

Juego web tipo "Preguntados" desarrollado con **React**, **Vite** y **Tailwind CSS**, funcionando 100% en el cliente de forma offline y guardando el progreso automáticamente en `localStorage`.

## Características Principales
- **400 Preguntas Oficiales**: 50 preguntas por cada una de las 8 categorías (Geografía, Arte, Entretenimiento, Programación, Matemáticas, Historia, Deportes, Ciencia).
- **8 Personajes Legendarios**: George, Arlette, Sabrina, Linus, Juanpi, Harry, Tincho y Albert con avatares.
- **Modos de Juego**: Solitario, Multijugador Local (2 jugadores) y Sala (hasta 5 participantes).
- **Ruleta Interactiva y Temporizador**: 15 segundos por pregunta con barra de progreso animada y efectos de sonido (SFX).
- **Persistencia**: Continuar partida tras recargar la página.

## Pasos para Publicar en Netlify
1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Compilar el proyecto para producción:
   ```bash
   npm run build
   ```
3. Vista previa local:
   ```bash
   npm run preview
   ```
4. Despliegue en Netlify:
   - Conecta tu repositorio de GitHub a Netlify.
   - Configuración de compilación:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - Netlify utilizará automáticamente el archivo `netlify.toml` incluido.
