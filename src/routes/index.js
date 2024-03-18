import fetch from "node-fetch";
import { Router } from 'express';
import moment from 'moment-timezone';
import 'moment/locale/es.js';

import https from 'https';
import axios from 'axios';
export const routes = Router();

moment.tz.setDefault('America/Guayaquil');
var formatDates = "MM/DD/YYYY";
var toFormatDates = "YYYY-MM-DD";

var oracleApi = async function (json = {}) {
	try {
		const raw = JSON.stringify({
		  "_id": "659ecf46f88896ff346d3bbf",
		  "description": "asasss",
		  "title": "pruebaa2",
		  "estado": false,
		  "meta_existe": true,
		  "users_suscribed": 0,
		  "data": [],
		  "created_at": "2023-04-28T03:43:57.278Z"
		});

		const requestOptions = {
		  method: "POST",
		    headers: {
		        'Content-Type': 'application/json'
		    },
		  body: raw,
		  redirect: "follow"
		};
		const resp = await fetch("https://bigdata.ecuavisa.com:10001/api/Trx/mdb/ISugerencia", requestOptions);;
		return await resp.text();
	} catch (error) {
		console.log(error);
		return null;
	}
}

routes.get("/", async function (req, res) {
	return res.json("Servicio de sugerencias: v0.01 - Prueba");
});

routes.post("/add", async function (req, res) {
	try {
		var sugerenciaResp = await oracleApi();
		if (sugerenciaResp) {
			return res.status(200).send({
				resp: true,
				message: "El registro se creó",
				data: sugerenciaResp
			});
		}
		return res.status(400).send({ resp: false, message: "Se ha generado un error" });
	} catch (error) {
		console.log(error);
		return res.status(400).send({ resp: false, message: "Se ha generado un error" });
	}
});