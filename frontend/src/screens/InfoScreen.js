import React, { useContext, useEffect, useReducer }  from 'react'
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

export default function InfoScreen() {
    return (
        <div>
            <Helmet>
                <title>Info Screen</title>
            </Helmet>
            <h1 className="text-center my-5">Web Information</h1>
            <section class="alert alert-primary">
            <p><b>Port: {port}</b></p>
            <p><b>Ops: {system}</b></p>
            <p><b>Node Version: {nodeVersion}</b></p>
            <p><b>Memory Usage: {memory}</b></p>
            <p><b>Path: {path}</b></p>
            <p><b>Process id: {processId}</b></p>
            <p><b>Title: {title}</b></p>
            <p><b>File Path: {filePath}</b></p>
        </section>
        </div>
    )
}
