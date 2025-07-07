# neosteps-white

## Descripción
Neosteps-white es un proyecto web que consta de múltiples pasos interactivos diseñados para guiar al usuario a través de un flujo específico. Cada paso está representado por un archivo HTML, CSS y JavaScript correspondiente.

## Estructura del Proyecto
El proyecto está organizado de la siguiente manera:

- **HTML**: Archivos como `step-1.html`, `step-2.html`, etc., representan cada paso del flujo.
- **CSS**: Archivos como `step-1.css`, `step-2.css`, etc., contienen los estilos específicos para cada paso. También hay un archivo `common.css` para estilos compartidos y `variables.css` para variables globales.
- **JavaScript**: Archivos como `step-1.js`, `step-2.js`, etc., manejan la lógica específica de cada paso. El archivo `common.js` contiene funciones compartidas y `state.js` gestiona el estado global del proyecto.
- **Assets**: Contiene recursos como fuentes, íconos e imágenes utilizados en el proyecto.

## Funcionamiento
1. El usuario navega a través de los pasos interactivos definidos en los archivos HTML.
2. Los estilos específicos de cada paso se aplican mediante los archivos CSS correspondientes.
3. La lógica de cada paso se gestiona con los archivos JavaScript específicos, mientras que las funciones compartidas y el estado global se manejan en `common.js` y `state.js`.

## Uso
Para ejecutar el proyecto, simplemente abre el archivo `index.html` en un navegador web. Este archivo actúa como punto de entrada y enlaza los recursos necesarios para iniciar el flujo interactivo.

### Detalles de uso
- Puedes navegar entre los diferentes pasos abriendo los archivos `step-1.html`, `step-2.html`, etc., directamente en el navegador, o bien utilizando enlaces de navegación dentro de la propia interfaz.
- Los cambios de estado y la información relevante del usuario se almacenan y gestionan mediante el archivo `js/state.js`, permitiendo persistencia entre pasos si así está implementado.
- Si deseas personalizar los estilos, puedes modificar los archivos CSS correspondientes a cada paso o el archivo `css/common.css` para cambios globales.
- Para agregar nuevos pasos, duplica uno de los archivos de paso existentes (`step-X.html`, `step-X.js`, `step-X.css`) y actualiza los enlaces y scripts según sea necesario.
- No se requiere instalación de dependencias ni servidor web: todo funciona de manera local y estática.

### Recomendaciones
- Utiliza navegadores modernos para asegurar la compatibilidad con las funcionalidades de JavaScript y CSS utilizadas.
- Si modificas los archivos JavaScript, recarga la página para ver los cambios reflejados.
- Para desarrollo colaborativo, mantén la estructura de carpetas y la convención de nombres para facilitar el mantenimiento del proyecto.