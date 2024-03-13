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
		    "picImg": "",
		    "description": "Descripcion de prueba sugerencia",
		    "title": "Prueba 1 sugerencia",
		    "estado": false,
		    "meta_existe": true,
		    "data": [],
		    "users_suscribed": 0
		});

		const requestOptions = {
		  method: "POST",
		    headers: {
		        'Content-Type': 'application/json'
		    },
		  body: raw,
		  redirect: "follow"
		};
		const resp = await fetch("https://sugerencias-ecuavisa.vercel.app/add", requestOptions);;
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