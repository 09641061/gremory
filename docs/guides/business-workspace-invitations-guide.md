# Business Workspace Invitations Guide

 Este documento recoge una idea de diseño futura para las invitaciones y la
 administracion de acceso del workspace.

No define el contrato actual del backend ni reemplaza el flujo vigente de
permisos. Su objetivo es dejar una referencia clara para evolucionar la UI sin
perder la simplicidad del caso actual.

## Objetivo

Separar el acceso del negocio en dos vistas y dos flujos de invitacion:

- una vista global para la organizacion
- una vista operativa para un establecimiento concreto

 La idea es que la UI siga siendo simple para empleados de un solo local, pero
 tambien pueda escalar a administracion multi-establecimiento sin mezclar
responsabilidades.

## Principios

- La organizacion es la capa global.
- El establecimiento es la capa operativa.
- `Owner` controla todo.
- `Admin` pertenece a la organizacion y puede tener acceso a uno o mas
  establecimientos.
- `Manager` opera un establecimiento concreto.
- `Worker` ejecuta tareas limitadas dentro de un establecimiento.
- La UI no debe obligar al usuario a pensar en permisos tecnicos primero.

## Flujo 1: vista global

Esta vista representa la administracion de la organizacion completa.

### Para quien sirve

- `Owner`
- `Admin`

### Que permite

- invitar usuarios a nivel organizacion
- asignar roles globales
- administrar acceso a uno o mas establecimientos
- ver miembros con alcance amplio
- promover o degradar roles globales

### Caracteristicas esperadas

- lista de miembros globales
- rol humano visible
- scope de organizacion visible
- asignacion de establecimientos cuando aplique
- acciones administrativas de alto nivel

## Flujo 2: vista de establecimiento

Esta vista representa la operacion de un local concreto.

### Para quien sirve

- `Manager`
- `Worker`
- `Owner` cuando actua sobre un local especifico

### Que permite

- invitar usuarios a un establecimiento
- asignar permisos operativos
- controlar acceso a modulos del local
- manejar personal del local
- editar informacion operativa permitida por el rol

### Caracteristicas esperadas

- miembros del establecimiento
- permisos por modulo
- alcance limitado al local
- acciones acotadas a operacion diaria

## Separacion de invitaciones

La idea es tratar la invitacion como un objeto que puede vivir en dos scopes:

- `ORGANIZATION`
- `ESTABLISHMENT`

Esto permite que la UI y el backend distingan claramente:

- una invitacion para un admin del negocio completo
- una invitacion para un gerente o trabajador de un local

## Modelo mental propuesto

- `Owner`
  - no se trata como una invitacion comun
  - representa la propiedad real del negocio
- `Admin`
  - invitado a la organizacion
  - puede operar varios establecimientos
- `Manager`
  - invitado a un establecimiento o a una asignacion operativa concreta
  - no modifica datos globales de la organizacion
- `Worker`
  - invitado a un establecimiento
  - solo accede a los modulos y acciones asignadas

## Implicacion para la UI

La pantalla actual de permisos funciona bien para el caso de un solo
establecimiento. Para el futuro, conviene pensar en dos superficies:

- `Organization Members`
  - para admins y roles globales
- `Establishment Permissions`
  - para managers y workers

La ventaja es que no se obliga a un gerente o worker a navegar una pantalla de
administracion global que no le corresponde.

## Escenarios de crecimiento

### Worker a Manager

- sigue siendo el mismo usuario
- cambia su alcance
- gana permisos operativos del local
- no gana control global de organizacion

### Manager a Admin

- sigue siendo el mismo usuario
- pasa de un scope de establecimiento a uno de organizacion
- puede recibir acceso a varios establecimientos
- gana mas responsabilidades administrativas

## Recomendacion de producto

- Mantener la vista actual para empleados de un solo establecimiento.
- Agregar una vista global separada para admins.
- No mezclar en una sola pantalla permisos de negocio completo con permisos de
  operacion de local.
- Usar roles semanticos antes que permisos tecnicos visibles al usuario final.

## Relacion con el contrato actual

Este documento no reemplaza:

- `business-workspace-frontend-contract.md`
- `business-workspace-contract.md`

Solo complementa esas guias con una idea de evolucion futura.

## En una frase

La UI puede crecer hacia dos flujos de invitacion y administracion, uno global
para organizacion y otro operativo para establecimiento, sin perder la
simplicidad del caso actual.
