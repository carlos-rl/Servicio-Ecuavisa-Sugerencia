import fetch from "node-fetch";
import { Router } from 'express';
import moment from 'moment-timezone';
import 'moment/locale/es.js';
import mongoose from "mongoose";
import { sugerenciaSchema } from "./../../models/sugerencia.js";
import { sugerenciaseguidosSchema } from "./../../models/sugerenciaseguidos.js";
import https from 'https';

import axios from 'axios';

import { interesSchema } from "./../../models/interes.js";
import { interesseguidosSchema } from "./../../models/interesseguidos.js";

import { usersSchema } from "./../../models/users.js";

export const routes = Router();
const ObjectIdS = mongoose.Types.ObjectId;

moment.tz.setDefault('America/Guayaquil');
var formatDates = "MM/DD/YYYY";
var toFormatDates = "YYYY-MM-DD";

var fechas = {
	getDate: () => {
		return moment().format(toFormatDates);
	},
	getDateAdd: (number, fecha = "", format = "MM-DD-YYYY") => {
		return moment((fecha == "" ? new Date() : fecha), format).add(number, 'days').format(toFormatDates);
	},
	getStartYear: () => {
		return moment().startOf('year').format(toFormatDates);
	},
	getEndYear: () => {
		return moment().endOf('year').format(toFormatDates);
	},
}

async function encontrarRegistroTitle(title) {
	var query = {
		$and: [
			{ "title": title },
		]
	};
	return await sugerenciaSchema.findOne(query);
}

async function encontrarSugenrenciaSeguido(userId, sugerenciaId) {
	var query = {
		$and: [
			{ "userId": userId },
			{ "sugerenciaId": sugerenciaId }
		]
	};
	return await sugerenciaseguidosSchema.findOne(query);
}


var oracleApi = async function (json = {}) {
	try {
		const resp_2 = await fetch("https://bigdata.ecuavisa.com:10001/api/Trx/mdb/ISugerencia", {
		  "headers": {
		    "accept": "text/plain",
		    "accept-language": "es-ES,es;q=0.9",
		    "content-type": "application/json-patch+json",
		    "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Opera\";v=\"107\", \"Chromium\";v=\"121\"",
		    "sec-ch-ua-mobile": "?0",
		    "sec-ch-ua-platform": "\"Windows\"",
		    "sec-fetch-dest": "empty",
		    "sec-fetch-mode": "cors",
		    "sec-fetch-site": "same-origin"
		  },
		  "referrer": "https://www.ecuavisa.com/",
		  "referrerPolicy": "strict-origin-when-cross-origin",
		  "body": "{\n  \"_id\": \"string\",\n  \"description\": \"string\",\n  \"title\": \"string\",\n  \"estado\": true,\n  \"meta_existe\": true,\n  \"users_suscribed\": 0,\n  \"data\": [\n    \"string\"\n  ],\n  \"created_at\": \"2024-03-13T00:08:02.643Z\"\n}",
		  "method": "POST",
		  "mode": "cors",
		  "credentials": "omit"
		});

		
		return await resp_2.text();

		const { data = [], action = { api: "ISugerencia", method: "POST" } } = json;
		const raw = {
		  "_id": data._id.toString(),
		  "description": data.description,
		  "title": data.title,
		  "estado": data.estado,
		  "meta_existe": data.meta_existe,
		  "users_suscribed": data.users_suscribed,
		  "data": [],
		  "created_at": new Date(data.created_at).toISOString()
		};

		const urlApis = `https://bigdata.ecuavisa.com:10001/api/Trx/mdb/${action.api}`;

		const config = {
		  headers: {
		    'Content-Type': 'application/json'
		  }
		};

		console.log(urlApis)

		const resp = await axios.post(urlApis, raw, config);
		return resp.data;

		return await resp.json();
	} catch (error) {
		console.log(error);
		return error;
	}

}

var oracleApiSugSegui = async function (json = {}) {
	return true;
	try {
		const { data = [], action = { api: "ISugerenciaSeguido", method: "POST" } } = json;

		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");

		var raw = {
			"_id": data._id.toString(),
			"userId": data.userId,
			"sugerenciaId": data.sugerenciaId,
			"meta_existe": data.meta_existe,
			"data": data.data,
			"created_at": new Date(data.created_at).toISOString()
		};

		var requestOptions = {
			method: action.method,
			headers: myHeaders,
			body: JSON.stringify(raw),
			redirect: 'follow'
		};

		console.log(json)
		console.log(raw)

		const resp = await fetch("https://bigdata.ecuavisa.com:10001/api/Trx/mdb/" + action.api, requestOptions);
		return await resp.json();
	} catch (error) {
		console.log(error);
		return null;
	}
}

async function addSugerencia(picImg, description, title, estado, meta_existe, data, users_suscribed) {
	var archivoObj = {
		picImg: picImg,
		description: description,
		title: title,
		estado: estado,
		meta_existe: meta_existe,
		data: data,
		users_suscribed: users_suscribed,
	};
	const addMongo = await sugerenciaSchema(archivoObj).save();

	/***************INICIO - CREATE - MANDA LA DATA A ORACLE, SUGERENCIA****************/
	const responseOracle = await oracleApi({
		data: addMongo,
		action: { api: "ISugerencia", method: "POST" }
	});
	console.log(responseOracle)
	/*****************FIN - CREATE - MANDA LA DATA A ORACLE, SUGERENCIA****************/

	if (addMongo) { return { resp: true, data: addMongo }; }
	return { resp: false, data: [], responseOracle };
}

async function obtenerSugerencia(id = 0) {
	var query = {};
	if (id != 0) {
		query = { "_id": mongoose.Types.ObjectId(id) };
	}
	const consulta2 = await sugerenciaSchema.find(query);
	return consulta2;
}

async function obtenerSugerenciaSeguido(userId = 0) {
	var query = {};
	if (userId != 0) {
		query = {
			$and: [
				{ "userId": userId },
			]
		};
	}
	const consulta2 = await sugerenciaseguidosSchema.find(query);
	return consulta2;
}

async function obtenerSugerenciaOne(id = 0) {
	var query = {};
	if (id != 0) {
		query = { "_id": mongoose.Types.ObjectId(id) };
	}
	const consulta2 = await sugerenciaSchema.findOne(query);
	return consulta2;
}

async function obtenerSugerenciaPublished(estado = true) {
	var query = {};
	query = { "estado": estado };

	const consulta2 = await sugerenciaSchema.find(query);
	return consulta2;
}

async function removeSugerencia(id = 0) {
	var query = {};
	if (id != 0) {
		query = { "_id": mongoose.Types.ObjectId(id) };
		const consulta2 = await sugerenciaSchema.deleteOne(query);
		return true;
	}
	return false;
}

async function addSugerenciaSeguido(userId, sugerenciaId) {
	var archivoObj = {
		userId: userId,
		sugerenciaId: sugerenciaId
	};
	const addMongo = await sugerenciaseguidosSchema(archivoObj).save();

	/***************INICIO - INSERT - MANDA LA DATA A ORACLE, SUGERENCIA SEGUIDO****************/
	const responseOracle = await oracleApiSugSegui({
		data: addMongo,
		action: { api: "ISugerenciaSeguidos", method: "POST" }
	});
	/*****************FIN - INSERT - MANDA LA DATA A ORACLE, SUGERENCIA SEGUIDO****************/

	if (addMongo) { return { resp: true, data: addMongo, responseOracle }; }
	return { resp: false, data: [] };
}

async function actualizarSugerencia(users_suscribed, _id) {
	var query = { "_id": mongoose.Types.ObjectId(_id) };
	const updateMongo = await sugerenciaSchema.updateOne(query, { $set: { "users_suscribed": users_suscribed } });
	if (updateMongo) return { resp: true, data: updateMongo };
	return true;
}

async function actualizarSugerenciaUsuario(_id, meta_existe = true) {
	var query = { "_id": mongoose.Types.ObjectId(_id) };
	const updateMongo = await sugerenciaseguidosSchema.updateOne(query, { $set: { "meta_existe": meta_existe } });
	if (updateMongo) return { resp: true, data: updateMongo };
	return true;
}

async function actualizarSugerenciaEditUpdate(_id, description, title, estado) {
	var query = { "_id": mongoose.Types.ObjectId(_id) };
	var archivoObj = {
		description: description,
		title: title,
		estado: estado
	};
	const updateMongo = await sugerenciaSchema.updateOne(query, { $set: archivoObj });
	if (updateMongo) return { resp: true, data: updateMongo };
	return true;
}

async function encontrarRegistro(id) {
	var query = { "_id": mongoose.Types.ObjectId(id) };
	return await sugerenciaSchema.findOne(query);
}

routes.get("/", async function (req, res) {
	return res.json("Servicio de sugerencias: v0.04 - " + moment().format('MMMM Do YYYY, h:mm:ss a'));
});

routes.post("/add", async function (req, res) {
	if (JSON.stringify(req.body) != '{}') {
		var { picImg = "", description = "", title = "", estado = true, meta_existe = true, data = [], users_suscribed = 0 } = req.body;
		if (title == "") return res.status(200).send({ resp: false, message: "Falta de enviar el título" });

		var getTituloResp = await encontrarRegistroTitle(title);
		if (getTituloResp) {
			return res.status(200).send({ resp: false, message: "El título ya está registrado" });
		};

		var sugerenciaResp = await addSugerencia(picImg, description, title, estado, meta_existe, data, users_suscribed);
		if (sugerenciaResp.resp) {
			return res.status(200).send({
				resp: true,
				message: "El registro se creó"
			});
		}
		return res.status(200).send({ resp: false, message: "Se ha generado un error" });
	}
	return res.status(200).send({ resp: false, message: "Ningún dato para guardar" });
});

routes.post("/edit/:id", async function (req, res) {
	if (JSON.stringify(req.body) != '{}') {
		const { id } = req.params;
		if (id) {
			var esValid = ObjectIdS.isValid(id);
			var esNum = !isNaN(id);
			if (esValid == false && esNum == false) {
				return res.status(200).send({
					resp: false,
					message: "El id no es válido"
				});
			}
		}

		var { description = "", title = "", estado = true, meta_existe = true, data = [], users_suscribed = 1 } = req.body;
		if (title == "") return res.status(200).send({ resp: false, message: "Falta de enviar el título" });

		var getTituloResp = await encontrarRegistro(id);
		if (getTituloResp) {
			var actualizarSugerencia = await actualizarSugerenciaEditUpdate(id, description, title, estado);

			/***************INICIO - UPDATE - MANDA LA DATA A ORACLE, SUGERENCIA****************/
			const responseOracle = await oracleApi({
				data: {
					"_id": id,
					"description": description,
					"title": title,
					"estado": estado,
					"meta_existe": getTituloResp.meta_existe,
					"users_suscribed": getTituloResp.users_suscribed,
					"data": [""],
					"created_at": getTituloResp.created_at
				},
				action: { api: "USugerencia", method: "PUT" }
			});
			/******************FIN - UPDATE - MANDA LA DATA A ORACLE, SUGERENCIA****************/

			if (actualizarSugerencia) {
				return res.status(200).send({
					resp: true,
					responseOracle,
					message: "El registro se actualizó"
				});
			}
		};

		return res.status(200).send({ resp: false, message: "Se ha generado un error" });
	}
	return res.status(200).send({ resp: false, message: "Ningún dato para guardar" });
});

routes.delete("/:id", async function (req, res) {
	const { id } = req.params;
	if (id) {
		var esValid = ObjectIdS.isValid(id);
		var esNum = !isNaN(id);
		if (esValid == false && esNum == false) {
			return res.status(200).send({
				resp: false,
				message: "El id no es válido"
			});
		}
	}

	var respuesta = await removeSugerencia(id);
	if (respuesta) {
		return res.status(200).send({
			resp: true,
			message: "Dato eliminado"
		});
	}

	return res.status(200).send({
		resp: false,
		message: "Dato no eliminado"
	});

});

routes.get("/all", async function (req, res) {
	var { id, userId } = req.query;
	if (id) {
		var esValid = ObjectIdS.isValid(id);
		var esNum = !isNaN(id);
		if (esValid == false && esNum == false) {
			return res.status(200).send({
				resp: false,
				message: "El id no es válido"
			});
		}
	} else {
		id = 0;
	}
	var sugerencias = await obtenerSugerencia(id);
	var sugerenciasSeguido = await obtenerSugerenciaSeguido(userId);
	return res.status(200).send({
		resp: true,
		data: sugerencias,
		dataSugerenciasSeguido: sugerenciasSeguido
	});
});



async function obtenerSugerenciaSeguidosUsuario(userId) {
	const filtro = {};
	if (userId != 0) {
		var query = [
			{ "userId": userId * 1 },
			{ "meta_existe": true },
		];
		filtro.$and = query;
	}
	return await sugerenciaseguidosSchema.aggregate([
		{
			$match: filtro
		},
		{
			$lookup: {
				from: 'sugerencias',
				let: { sugId: { $toObjectId: '$sugerenciaId' } },
				pipeline: [
					{
						$match: {
							$expr: { $eq: ['$_id', '$$sugId'] },
							// title: { $in: title },
						}
					}
				],
				as: 'su'
			}
		},
		{
			$project: {
				_id: 1,
				userId: 1,
				title: { $arrayElemAt: ['$su.title', 0] },
				follow: "$meta_existe",
				created_at: 1,
			}
		}
	]);
}

routes.get("/get/usuario/:id", async function (req, res) {
	var { id = 0 } = req.params;

	var sugerenciasSeguido = await obtenerSugerenciaSeguidosUsuario(id);
	return res.status(200).send({
		resp: true,
		dataSugerenciasSeguido: sugerenciasSeguido
	});
});

routes.get("/:id", async function (req, res) {
	var { id } = req.params;
	if (id) {
		var esValid = ObjectIdS.isValid(id);
		var esNum = !isNaN(id);
		if (esValid == false && esNum == false) {
			return res.status(200).send({
				resp: false,
				message: "El id no es válido"
			});
		}
	} else {
		id = 0;
	}
	var sugerencias = await obtenerSugerenciaOne(id);
	return res.status(200).send({
		resp: true,
		data: sugerencias
	});
});

routes.get("/published", async function (req, res) {
	var { estado = true } = req.query;
	var sugerencias = await obtenerSugerenciaPublished(estado);
	return res.status(200).send({
		resp: true,
		data: sugerencias
	});

});

async function obtenerSugerenciaSeguidoAll(idSugerencia) {
	const filtro = {};
	if (idSugerencia != 0) {
		var query = [
			{ "sugerenciaId": idSugerencia }
		];
		filtro.$and = query;
	}
	return await sugerenciaseguidosSchema.aggregate([
		{
			$match: filtro
		},
		{
			$lookup: {
				from: 'users',
				localField: 'userId',
				foreignField: 'wylexId',
				as: 'user'
			}
		},
		{
			$project: {
				_id: 1,
				userId: 1,
				wylexId: { $arrayElemAt: ['$user.wylexId', 0] },
				avatar: { $arrayElemAt: ['$user.avatar', 0] },
				first_name: { $arrayElemAt: ['$user.first_name', 0] },
				last_name: { $arrayElemAt: ['$user.last_name', 0] },
				phone_number: { $arrayElemAt: ['$user.phone_number', 0] },
				email: { $arrayElemAt: ['$user.email', 0] },
				site: { $arrayElemAt: ['$user.site', 0] },
				logged_at: { $arrayElemAt: ['$user.logged_at', 0] },
				updated_at: { $arrayElemAt: ['$user.updated_at', 0] },
				validated_at: { $arrayElemAt: ['$user.validated_at', 0] },
				meta_existe: 1,
				created_at: 1,
			}
		}
	]);
}

routes.post("/addsugerencia", async function (req, res) {
	if (JSON.stringify(req.body) != '{}') {
		var { userId = "", sugerenciaId = "", estado = 1 } = req.body;
		if (userId == "") return res.status(200).send({ resp: false, message: "Falta de enviar el userID" });
		if (sugerenciaId == "") return res.status(200).send({ resp: false, message: "Falta de enviar el sugerenciaID" });

		var getTituloResp = await encontrarSugenrenciaSeguido(userId, sugerenciaId);
		var sugerencia = await obtenerSugerencia(sugerenciaId);
		if (estado == '1') {
			sugerencia[0].users_suscribed = sugerencia[0].users_suscribed * 1 + 1;
		} else {
			if (sugerencia[0].users_suscribed != '0') {
				sugerencia[0].users_suscribed = sugerencia[0].users_suscribed - 1;
			}
		}
		var respActualizar = await actualizarSugerencia(sugerencia[0].users_suscribed, sugerenciaId);

		/***************INICIO - UPDATE - MANDA LA DATA A ORACLE, SUGERENCIA****************/
		const responseOracle = await oracleApi({
			data: {
				"_id": sugerenciaId,
				"description": sugerencia[0].description,
				"title": sugerencia[0].title,
				"estado": sugerencia[0].estado,
				"meta_existe": sugerencia[0].meta_existe,
				"users_suscribed": sugerencia[0].users_suscribed,
				"data": sugerencia[0].data,
				"created_at": sugerencia[0].created_at
			},
			action: { api: "USugerencia", method: "PUT" }
		});
		/*****************FIN - UPDATE - MANDA LA DATA A ORACLE, SUGERENCIA****************/

		if (getTituloResp) {
			var respActualizarSugUsuario = await actualizarSugerenciaUsuario(getTituloResp._id, estado);

			/***************INICIO - UPDATE - MANDA LA DATA A ORACLE, SUGERENCIA SEGUIDO****************/
			const responseOracleSS = await oracleApiSugSegui({
				data: {
					"_id": getTituloResp._id,
					"userId": getTituloResp.userId,
					"sugerenciaId": getTituloResp.sugerenciaId,
					"meta_existe": estado,
					"data": getTituloResp.data,
					"created_at": getTituloResp.created_at
				},
				action: { api: "USugerenciaSeguidos", method: "PUT" }
			});
			// console.log(respOracleSS)
			/****************FIN - UPDATE - MANDA LA DATA A ORACLE, SUGERENCIA SEGUIDO*****************/

			return res.status(200).send({
				resp: true,
				message: "El registro se creó",
				data: respActualizar,
				response: responseOracleSS
			});
		};

		var sugerenciaResp = await addSugerenciaSeguido(userId, sugerenciaId);
		if (sugerenciaResp.resp) {
			return res.status(200).send({
				resp: true,
				message: "El registro se creó",
				response: sugerenciaResp.responseOracle
			});
		}
		return res.status(200).send({ resp: false, message: "Se ha generado un error" });
	}
	return res.status(200).send({ resp: false, message: "Ningún dato para guardar" });
});

routes.get("/sugerencia/group/usuario", async function (req, res) {
	var { idSugerencia } = req.query;
	if (idSugerencia) {
		var id = idSugerencia;
		var esValid = ObjectIdS.isValid(id);
		var esNum = !isNaN(id);
		if (esValid == false && esNum == false) {
			return res.status(200).send({
				resp: false,
				message: "El id no es válido"
			});
		}
	} else {
		idSugerencia = 0;
	}
	var interesUsuario = await obtenerSugerenciaSeguidoAll(idSugerencia);
	return res.status(200).send({
		resp: true,
		data: interesUsuario
	});
});

var oracleApiIntereses = async function (json = {}) {
	// return true;
	try {
		const { data = [], method = "ISugerencia" } = json;

		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");

		var raw = {
			"_id": data._id.toString(),
			"description": data.description,
			"title": data.title,
			"estado": data.estado,
			"meta_existe": data.meta_existe,
			"users_suscribed": data.users_suscribed,
			"data": data.data,
			"created_at": new Date(data.created_at).toISOString()
		};

		var requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: JSON.stringify(raw),
			redirect: 'follow'
		};
		const resp = await fetch("https://bigdata.ecuavisa.com:10001/api/Trx/mdb/" + method, requestOptions);
		return await resp.json();
	} catch (error) {
		console.log(error);
		return null;
	}

}

var oracleApiInteSegui = async function (json = {}) {
	try {
		const { data = [], method = "ISugerenciaSeguido" } = json;

		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");

		var raw = {
			"_id": data._id.toString(),
			"userId": data.userId,
			"sugerenciaId": data.sugerenciaId,
			"meta_existe": data.meta_existe,
			"data": data.data,
			"created_at": new Date(data.created_at).toISOString()
		};

		var requestOptions = {
			method: 'POST',
			headers: myHeaders,
			body: JSON.stringify(raw),
			redirect: 'follow'
		};

		const resp = await fetch("https://bigdata.ecuavisa.com:10001/api/Trx/mdb/" + method, requestOptions);
		return await resp.json();
	} catch (error) {
		console.log(error);
		return null;
	}
}

/*SECCIONES DE INTERES*/

async function addInteresSeguido(userId, sugerenciaId) {
	var archivoObj = {
		userId: userId,
		interesId: sugerenciaId
	};
	const addMongo = await interesseguidosSchema(archivoObj).save();

	// var url = "https://bigdata.ecuavisa.com:10001/api/Trx/mdb/IInteresSeguidos";
	// var isAddBody = {
	// 	"_id": addMongo._id.toString(),
	// 	"userId": addMongo.userId,
	// 	"interesId": addMongo.interesId,
	// 	"meta_existe": addMongo.meta_existe,
	// 	"data": addMongo.data,
	// 	"created_at": new Date(addMongo.created_at).toISOString()
	// };

	// const response = await fetch(url, {
	// 	method: 'POST',
	// 	headers: {
	// 		'Content-Type': 'application/json',
	// 	},
	// 	body: JSON.stringify(isAddBody),
	// });

	// const responseData = await response.json();

	if (addMongo) { return { resp: true, data: addMongo }; }
	return { resp: false, data: [] };
}

async function actualizarInteresUsuario(_id, meta_existe = true) {

	var query = { "_id": mongoose.Types.ObjectId(_id) };
	// const updateMongo = await interesseguidosSchema.updateOne(query, { $set: { "meta_existe": meta_existe } });

	const IsegUpdate = await interesseguidosSchema.findOneAndUpdate(
		query,
		{ $set: { "meta_existe": meta_existe }, }
		// { new: true } // Devuelve el documento actualizado
	);

	// var putUrl = "https://bigdata.ecuavisa.com:10001/api/Trx/mdb/UInteresSeguidos";
	// var putISegBody = {
	// 	"_id": IsegUpdate._id.toString(),
	// 	"userId": IsegUpdate.userId,
	// 	"interesId": IsegUpdate.interesId.toString(),
	// 	"meta_existe": IsegUpdate.meta_existe,
	// 	"data": IsegUpdate.data,
	// 	"created_at": new Date(IsegUpdate.created_at).toISOString()
	// };
	// const resIS = await fetch(putUrl, {
	// 	method: 'PUT',
	// 	headers: {
	// 		'Content-Type': 'application/json',
	// 	},
	// 	body: JSON.stringify(putISegBody),
	// });
	// const putResDataIS = await resIS.json();	

	if (IsegUpdate) return { resp: true, data: IsegUpdate };
	return true;

}

async function actualizarInteres(users_suscribed, interesId) {
	//var query = {"_id": mongoose.Types.ObjectId(_id) };
	var query = { "interesId": interesId };
	const updateMongo = await interesSchema.updateOne(query, { $set: { "users_suscribed": users_suscribed } });
	if (updateMongo) return { resp: true, data: updateMongo };
	return true;
}

async function obtenerInteres(interesId = 0) {
	var query = {};
	if (interesId != 0) {
		query = { "interesId": interesId }//{"_id": mongoose.Types.ObjectId(id) };
	}
	const consulta2 = await interesSchema.find(query);
	return consulta2;
}

async function encontrarInteresSeguido(userId, interesId) {
	var query = {
		$and: [
			{ "userId": userId },
			{ "interesId": interesId }
		]
	};
	return await interesseguidosSchema.findOne(query);
}

async function encontrarRegistroTitleInteres(interesId) {
	var query = {
		$and: [
			{ "interesId": interesId },
		]
	};
	return await interesSchema.findOne(query);
}

async function addSugerenciaInteres(interesId, description, title, estado, meta_existe, data, users_suscribed) {
	var archivoObj = {
		interesId: interesId,
		description: description,
		title: title,
		estado: estado,
		meta_existe: meta_existe,
		data: data,
		users_suscribed: users_suscribed,
	};
	const addMongo = await interesSchema(archivoObj).save();
	if (addMongo) { return { resp: true, data: addMongo }; }
	return { resp: false, data: [] };
}

async function obtenerInteresSeguido(userId = 0) {
	var query = {};
	if (userId != 0) {
		query = {
			$and: [
				{ "userId": userId },
			]
		};
	}
	const consulta2 = await interesseguidosSchema.find(query);
	return consulta2;
}

async function obtenerInteresSeguidoAll(interesId) {
	const filtro = {};
	if (interesId != 0) {
		var query = [
			{ "interesId": interesId }
		];
		filtro.$and = query;
	}

	return await interesseguidosSchema.aggregate([
		{
			$match: filtro
		},
		{
			$lookup: {
				from: 'users',
				localField: 'userId',
				foreignField: 'wylexId',
				as: 'user'
			}
		},
		{
			$project: {
				_id: 0,
				userId: 1,
				first_name: { $arrayElemAt: ['$user.first_name', 0] },
				last_name: { $arrayElemAt: ['$user.last_name', 0] },
				phone_number: { $arrayElemAt: ['$user.phone_number', 0] },
				email: { $arrayElemAt: ['$user.email', 0] },
				site: { $arrayElemAt: ['$user.site', 0] },
				meta_existe: 1,
				interesId: 1,
				created_at: 1,
			}
		}
	]);
}


routes.post("/interes/add", async function (req, res) {
	try {
		if (JSON.stringify(req.body) === '{}') {
			return res.status(200).send({ resp: false, message: "Ningún dato para guardar" });
		}
		// if (JSON.stringify(req.body) != '{}') {
		var { userId = 0, interesId = 0, description = "", title = "", estado = true, meta_existe = true, data = [], users_suscribed = 0 } = req.body;
		if (title == "") return res.status(200).send({ resp: false, message: "Falta de enviar el título" });

		var getTituloResp = await encontrarRegistroTitleInteres(interesId);
		if (getTituloResp) {
			var interes = getTituloResp;

			if (estado == '1') {
				interes.users_suscribed = interes.users_suscribed * 1 + 1;

			} else {
				if (interes.users_suscribed != '0') {
					interes.users_suscribed = interes.users_suscribed - 1;
				}
			}

			var respActualizar = await actualizarInteres(interes.users_suscribed, interesId);

			var respInteresSeguido = await encontrarInteresSeguido(userId, interesId);
			if (respInteresSeguido) {
				var respActualizarSugUsuario = await actualizarInteresUsuario(respInteresSeguido._id, estado);
				//update
			} else {
				var respAddSInt = await addInteresSeguido(userId, interesId);
				//insert
			}

			// inicio - Realizar la solicitud PUT con fetch - intereses
			// var putUrl = "https://bigdata.ecuavisa.com:10001/api/Trx/mdb/UInteres";
			// var putRequestBody = {
			// 	"_id": interes._id.toString(),
			// 	"interesId": interes.interesId,
			// 	"description": interes.description,
			// 	"title": interes.title,
			// 	"estado": interes.estado,
			// 	"meta_existe": interes.meta_existe,
			// 	"users_suscribed": interes.users_suscribed,
			// 	"data": interes.data,
			// 	"created_at": new Date(interes.created_at).toISOString()
			// };
			// const putResponse = await fetch(putUrl, {
			// 	method: 'PUT',
			// 	headers: {
			// 		'Content-Type': 'application/json',
			// 	},
			// 	body: JSON.stringify(putRequestBody),
			// });
			// const putResponseData = await putResponse.json();
			// return res.status(200).send({
			// 	resp: true,
			// 	message: "El registro se actualizo oracle",
			// 	response: putResponseData
			// });
			// fin - Realizar la solicitud PUT con fetch - intereses

			return res.status(200).send({
				resp: true,
				message: "El registro se actualizo"
			});

		} else {
			// console.log("para registrar");
			var sugerenciaResp = await addSugerenciaInteres(interesId, description, title, estado, meta_existe, data, users_suscribed);
			if (sugerenciaResp.resp) {
				var respInteresSeguido = await encontrarInteresSeguido(userId, interesId);

				if (respInteresSeguido) {
					var respActualizarSugUsuario = await actualizarInteresUsuario(respInteresSeguido._id, estado);
					//update
				} else {
					var respAddSInt = await addInteresSeguido(userId, interesId);
					//insert
				}

				// Aquí es donde haremos la solicitud POST con fetch
				// var url = "https://bigdata.ecuavisa.com:10001/api/Trx/mdb/IInteres";
				// var requestBody = {
				// 	"_id": sugerenciaResp.data._id.toString(),
				// 	"interesId": sugerenciaResp.data.interesId,
				// 	"description": sugerenciaResp.data.description,
				// 	"title": sugerenciaResp.data.title,
				// 	"estado": sugerenciaResp.data.estado,
				// 	"meta_existe": sugerenciaResp.data.meta_existe,
				// 	"users_suscribed": sugerenciaResp.data.users_suscribed,
				// 	"data": sugerenciaResp.data.data,
				// 	"created_at": new Date(sugerenciaResp.data.created_at).toISOString()
				// };
				// const response = await fetch(url, {
				// 	method: 'POST',
				// 	headers: {
				// 		'Content-Type': 'application/json',
				// 	},
				// 	body: JSON.stringify(requestBody),
				// });

				// const responseData = await response.json();
				// console.log(responseData);

				// // Enviar la respuesta al cliente después de realizar la solicitud POST
				// return res.status(200).send({
				// 	resp: true,
				// 	message: "El registro se creó intereses",
				// 	responseData
				// });

				return res.status(200).send({
				  resp:true,
				  message:"El registro se creó 2"
				});
			}
		}

		return res.status(200).send({ resp: false, message: "Se ha generado un error" });
		// }
		// return res.status(200).send({ resp: false, message: "Ningún dato para guardar" });
	} catch (error) {
		// Manejar cualquier error que pueda ocurrir durante la ejecución
		console.error('Error:', error);
		return res.status(500).send({ resp: false, message: "Error interno del servidor" });
	}
});


routes.get("/interes/all", async function (req, res) {
	var { interesId, userId } = req.query;
	if (interesId) {
		var esValid = true;
		var esNum = !isNaN(id);
		if (esValid == false && esNum == false) {
			return res.status(200).send({
				resp: false,
				message: "El id no es válido"
			});
		}
	} else {
		interesId = 0;
	}
	var sugerencias = await obtenerInteres(interesId);
	var sugerenciasSeguido = await obtenerInteresSeguido(userId);
	return res.status(200).send({
		resp: true,
		data: sugerencias,
		dataInteresSeguido: sugerenciasSeguido
	});
});

routes.get("/interes/group/usuario", async function (req, res) {
	var { interesId = 0, userId } = req.query;
	var interesUsuario = await obtenerInteresSeguidoAll(interesId);
	return res.status(200).send({
		resp: true,
		data: interesUsuario
	});
});

async function obtenerSugerenciaEstado() {
	var query = {};
	query = { "estado": true };

	const resp = await sugerenciaSchema.aggregate([
		{
			$match: query
		},
		{
			$project: {
				_id: 1,
				description: 1,
				title: 1,
				users_suscribed: 1,
			}
		}
	]);
	return resp;
}

routes.get("/sugerencias/get/all", async function (req, res) {
	var id = 0;
	try {
		var sugerencias = await obtenerSugerenciaEstado();
		return res.status(200).send({
			resp: true,
			data: sugerencias
		});
	} catch (error) {
		console.log(error);
		return res.status(200).send({
			resp: false,
			mensaje: error
		});
	}
});

async function obtenerInteresesEstado() {
	var query = {};
	query = { "estado": true };

	const resp = await interesSchema.aggregate([
		{
			$match: query
		},
		{
			$project: {
				_id: 1,
				description: 1,
				title: 1,
				users_suscribed: 1,
			}
		}
	]);
	return resp;
}

routes.get("/intereses/get/all", async function (req, res) {
	var id = 0;
	try {
		var intereses = await obtenerInteresesEstado();
		return res.status(200).send({
			resp: true,
			data: intereses
		});
	} catch (error) {
		console.log(error);
		return res.status(200).send({
			resp: false,
			mensaje: error
		});
	}
});