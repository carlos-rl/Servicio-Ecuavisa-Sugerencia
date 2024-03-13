## Requisitos
- Node Js v14.x

## Librerías
- dotenv v16.0.3
- express v4.18.2
- moment-timezone v0.5.43
- mongoose v6.10.5
- node-fetch v3.3.1
- nodemon v2.0.22

## Programas & utilidades (windows)
- Sublime Text
- Git & github
- Postman
- Cualquier navegador

## Project Setup

```sh
npm install
```

## Utilización

**

#### Añadir sugerencias

```http
  POST /add
```

| Parámetros | Tipo     | Descripción                | headers                |
| :-------- | :------- | :------------------------- | :------------------------- |
| `{ "description": "Gamer PC 2 soy descripción",  "title": "Gamer PC 2", "estado":true, "meta_existe":true,  "data":[], "users_suscribed":1 } ` | `objecto` | Mandar por raw los parámetros tal como se indica| `"Content-Type": "application/json" `|

```http
  POST /edit:id
```

| Parámetros | Tipo     | Descripción                | headers                |
| :-------- | :------- | :------------------------- | :------------------------- |
| `{ "description": "Gamer PC 2 soy descripción",  "title": "Gamer PC 2", "estado":true } ` | `objecto` | Mandar por raw los parámetros tal como se indica| `"Content-Type": "application/json" `|

##### Respuestas:

| Return            | Descripción             |
| :------------------------   | :------------------------   |
|` { resp:false,message: "Ningún dato para guardar" }` | Significa que no se envió ningún parámetro |
|` { resp:true,message: "El registro se creó" }` | Significa que el registro no tuvo inconvenientes y pudo guardar el registro. |

#### Buscar sugerencias por id o todos los registros

```http
  GET /all
```
o

```http
  GET /all?id=idObject
```
| Método | Tipo     | Descripción                |
| :-------- | :------- | :------------------------- |
| GET | `number` o  `ObjectId` | Se puede hacer una búsqueda por ObjectId de mongoDB que retorna un elemento o no añadir el parámetro para que retorne todos los elementos. |

#### Eliminar sugerencias

```http
  DELETE /{id}
```
| Método | Tipo     | Descripción                |
| :-------- | :------- | :------------------------- |
| GET | `number` o  `ObjectId` | Se puede eliminar el registro solo con el id. |

#### Listar sugerencias por estado

```http
  GET /published
```
 | Descripción                |
 | :------------------------- |
 | Trae todos los registros que tenga el estado en true. |

o
```http
  GET /published?estado=false
```
 | Descripción                |
 | :------------------------- |
 | Trae todos los registros que tenga el estado en true o false, dependiendo que se le asigne en la URL. |


## Authors

- [@redyman](https://github.com/redyman/)
- [@eriverec](https://github.com/eriverec/)
- [@carlos-rl](https://github.com/carlos-rl/)