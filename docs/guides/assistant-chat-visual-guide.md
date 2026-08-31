# Assistant Chat Visual Guide

This document summarizes como esta armado hoy el chat del assistant para poder
replicar la vista sin tener que reverse-enginear los componentes.

La experiencia se divide en dos estados:

- `New chat`
- `Chat viejo` o `chat existente` desde el historial

Ademas, la visual del `AssistantAvatar` y la composicion del composer son las
piezas que unifican toda la experiencia.

## Referencias clave

- [Vista principal del chat](/C:/Users/jjqui/Documents/GitHub/Takodu/ui/contexts/assistant/interfaces/components/chat-view/assistant-chat-view.tsx)
- [Empty state del chat](/C:/Users/jjqui/Documents/GitHub/Takodu/ui/contexts/assistant/interfaces/components/chat-view/assistant-chat-empty-state.tsx)
- [Composer del chat](/C:/Users/jjqui/Documents/GitHub/Takodu/ui/contexts/assistant/interfaces/components/chat-view/assistant-chat-composer.tsx)
- [Message thread](/C:/Users/jjqui/Documents/GitHub/Takodu/ui/contexts/assistant/interfaces/components/chat-view/assistant-chat-thread.tsx)
- [Message bubble](/C:/Users/jjqui/Documents/GitHub/Takodu/ui/contexts/assistant/interfaces/components/chat-view/assistant-chat-message-bubble.tsx)
- [Saludo / intro](/C:/Users/jjqui/Documents/GitHub/Takodu/ui/contexts/assistant/interfaces/components/chat-view/assistant-chat-welcome.tsx)
- [Avatar del assistant](/C:/Users/jjqui/Documents/GitHub/Takodu/ui/contexts/assistant/interfaces/components/icons/assistant-avatar/assistant-avatar.tsx)
- [Animacion del avatar](/C:/Users/jjqui/Documents/GitHub/Takodu/ui/contexts/assistant/interfaces/components/icons/assistant-avatar/use-assistant-avatar-animation.ts)
- [Conversation transform](/C:/Users/jjqui/Documents/GitHub/Takodu/ui/contexts/assistant/application/internal/transforms/assistant-conversation.transform.ts)

## Estructura General

La pagina `app/(protected)/(app)/chat/page.tsx` resuelve si existe o no
`conversationId` en la URL.

- sin `conversationId`: se renderiza el estado de `New chat`
- con `conversationId`: se renderiza el historial o `chat viejo`

La vista principal vive en `AssistantChatView` y decide:

- si el chat is in empty or conversational mode
- si el composer va en modo `minimal` o `floating`
- si el hilo necesita saludo de intro
- si la active conversation should be rehydrated or updated

## Nuevo Chat

### Que se ve

El estado de `New chat` es una centered, clean, lightweight screen.

Elementos visibles:

- un bloque central con `AssistantAvatar`
- un titulo principal grande
- un composer tipo pildora debajo

### Composicion Visual

- contenedor de alto completo aproximado: `min-h-[calc(100vh-6rem)]`
- alineacion vertical centrada
- contenido contenido en una columna de ancho maximo
- separacion moderada entre el bloque visual y el composer

### Empty State

El empty state ya no se siente como una tarjeta pesada.

Rasgos visuales:

- avatar sin contenedor visible, para que destaque solo el assistant
- fondo claro tipo `card`
- sombra leve
- titulo centrado con jerarquia marcada
- copy corto y de apoyo

Copy por defecto:

- `What do you want to manage today?`

### Composer en Nuevo Chat

En este estado el composer usa `variant="minimal"`.

Visualmente:

- shell mas limpio
- ancho maximo `max-w-3xl`
- fondo translucido suave
- forma de pildora cuando hay una sola linea
- se expande a tarjeta redondeada cuando el texto crece
- menos presencia visual que en el chat existente

## Chat Viejo / Existente

### Que se ve

Cuando existe `conversationId`, la pantalla cambia a una history view
clasica.

Componentes visibles:

- message list en un dedicated thread
- avatar del assistant en cada mensaje del assistant
- composer flotante fijo abajo

### Composicion Visual

- el message area ocupa todo el available height
- el scroll vive dentro del thread, no en toda la pagina
- el composer queda superpuesto en la parte inferior
- there is extra bottom padding para que el last message no quede tapado
- el bloque de mensajes tiene more vertical space que en previous versions

### Sensacion Visual

Este modo busca parecerse a la captura de referencia:

- more spacing between messages
- mas amplitud en el canvas
- assistant a la izquierda
- usuario a la derecha
- composer siempre disponible abajo

## Render de Mensajes

### User Messages

- alineados a la derecha
- bubble compacta
- fondo claro tipo capsule
- borde fino suave
- ancho contenido para que no ocupe demasiado

### Assistant Messages

- alineados a la izquierda
- avatar circular antes del texto
- texto sin fondo pesado
- ancho mas generoso que el usuario
- lectura mas editorial y menos “burbuja dura”

### Contrato Markdown Del Assistant

La vista del assistant no intenta soportar todo Markdown posible. La regla
actual es mantener lo que aporta valor real al negocio y reducir lo que solo
agrega costo o complejidad visual.

Rendering currently happens directly en el cliente con `react-markdown` + `remark-gfm`.
Ya no existe una capa intermedia que convierta el contenido a HTML antes de
reach the message bubble.

#### Soportado

- párrafos
- saltos de línea
- encabezados simples
- listas con viñetas
- listas ordenadas
- tablas
- negrita
- cursiva
- links
- código inline
- bloques de código
- blockquotes
- separadores horizontales

#### Reducido o omitido

- imágenes
- HTML embebido
- footnotes
- task lists o checkboxes
- headings with dedicated styling beyond the normal text flow

#### Criterio de diseño

La meta no es renderizar todo, sino:

- conservar Markdown rico donde aporta valor
- evitar adornos que el usuario casual probablemente no usa
- bajar carga de render sin perder tablas, listas ni código
- mantener una lectura clara y rápida en el chat

### Spacing Between Messages

La separacion vertical se aumento para que el hilo respire mejor.

Rasgos:

- large gap entre mensajes
- padding superior e inferior mayor en el thread
- lectura mas limpia cuando hay varios turnos
- mejor distincion visual entre bloques sucesivos

## Saludo / Intro

### Nuevo Chat

En el estado vacio se muestra `AssistantChatEmptyState`, que funciona como
intro inicial antes de escribir.

### Chat Existente

`AssistantChatWelcome` se usa como saludo de apoyo cuando hace falta dar una
intro visual antes del hilo.

Esto ayuda a que la vista no arranque seca y mantiene una firma visual comun.

Rasgos:

- avatar a la izquierda
- texto de bienvenida corto
- borde suave
- fondo blanco o tipo card
- sin competir con el composer

## Composer / Message Pill

### Forma

- `single-line`: pildora horizontal
- `multiline`: tarjeta redondeada con footer separado
- `minimal`: variante compacta para el estado inicial

### Elementos

- `textarea` auto-resize
- boton circular de envio con `ArrowUp`
- label accesible con `sr-only`

### Comportamiento Visual

- el alto se ajusta al contenido
- la transicion entre una linea y varias lineas es suave
- el boton se mantiene visible y alineado
- el shell usa bordes y sombras sutiles
- en modo `floating`, el fondo del wrapper se mantiene transparente

### Posicion

En el chat existente:

- el composer se monta como overlay inferior
- el wrapper usa `pointer-events-none`
- el panel real usa `pointer-events-auto`
- el ancho maximo sigue el canvas del chat

## Thread De Mensajes

### Estructura

- contenedor `relative isolate`
- scroll interno con `overflow-y-auto`
- padding inferior grande para no tapar mensajes con el composer flotante

### Estados

1. `Loading`
   - muestra skeletons
   - alterna izquierda y derecha para simular dialogo

2. `With messages`
   - renders one bubble por mensaje
   - aplica separacion amplia entre bloques
   - deja un `bottomRef` al final para autoscroll

3. `Without messages`
   - muestra el saludo / intro
   - mantiene el espacio visual limpio y centrado

## Loading State

While loading la conversacion, el thread usa skeletons:

- cuatro bloques
- altura amplia
- `animate-pulse`
- alternancia izquierda/derecha para simular dialogo

La version actual no intenta parecer un panel vacio.
Prefiere mantener la estructura del chat visible desde el inicio.

## Avatar Del Assistant

El icono del assistant no es decorativo. Define la identidad visual del chat.

### Donde aparece

- en el empty state de `New chat`
- beside the messages del assistant
- en el saludo / intro
- como base de la animacion del avatar

### Como se muestra

El componente `AssistantAvatar`:

- renderiza un boton con variante `framed` o `flat`
- usa `next/image`
- recibe `className`, `iconClassName`, `iconSize`, `iconAlt` y `variant`

### Regla Visual

El avatar debe sentirse:

- pequeno pero reconocible
- limpio y sin un fondo que compita con el contenido
- consistente con el sistema del chat
- presente tanto en empty states como en contexto conversacional

## Animacion Del Avatar

La animacion del `AssistantAvatar` sigue existiendo, pero la idea visual
actual privilegia costo bajo de render por encima de una secuencia pesada
de frames.

### Lectura general

- el avatar cambia de estado por interaccion directa
- la animacion se apoya en transforms y opacidad
- no se busca que el chat re-renderice de forma costosa por cada frame

### Estados internos

- `idle`
- `growing`
- `shaking`
- `ghost`

### Recomendacion visual

Si el avatar se usa varias veces o aparece en mas pantallas, la version ideal
es mantenerlo simple y barato para el navegador.

## Normalizacion De Roles

This is important so that los mensajes viejos no queden todos del mismo lado.

### Regla base

- `USER` o cualquier variante no reconocida termina como `user`
- `ASSISTANT` y `AGENT` terminan como `assistant`

### Fallback for legacy conversations

Some older conversations arrive con roles planos o without real distinction.

En ese caso:

- si no aparece ningun mensaje de assistant
- y la lista tiene mas de un mensaje
- se recupera la alternancia por orden

Resultado:

- `user`
- `assistant`
- `user`
- `assistant`

Esto mantiene la izquierda/derecha aun cuando el backend venga incompleto.

## Reglas De Replica Visual

To faithfully recreate the experience, follow these rules:

1. `New chat` debe verse centrado, limpio y abierto.
2. `Chat existente` debe priorizar el historial y reservar el composer abajo.
3. El `AssistantAvatar` debe repetirse como firma visual.
4. El composer debe sentirse como una pildora flexible, no como un textarea estandar.
5. Assistant messages should remain a la izquierda.
6. User messages should remain a la derecha.
7. Spacing between messages should be generous.
8. Old conversations should have un fallback de roles si el backend no distingue bien.

## Mapa Rapido De Implementacion

- `AssistantChatView`: chooses between a new and existing conversation
- `AssistantChatEmptyState`: centered initial screen
- `AssistantChatThread`: layout del historial, saludo e hilo
- `AssistantChatComposer`: input principal
- `AssistantChatMessageBubble`: styling and alignment de mensajes
- `AssistantChatWelcome`: saludo / intro reutilizable
- `AssistantAvatar`: identidad del assistant
- `assistant-conversation.transform.ts`: normalizacion de roles para chats viejos

## Resumen Corto

- `New chat` = empty state centrado + composer minimal + avatar protagonista
- `Chat viejo` = hilo con historial + bubbles alternadas + composer flotante
- `AssistantAvatar` = firma visual comun en ambos estados
- `Roles legacy` = fallback por orden si el backend no distingue assistant y user
