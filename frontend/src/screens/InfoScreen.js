import React from 'react'
import { Helmet } from 'react-helmet-async';

export default function InfoScreen() {

    return (
        <div>
            <Helmet>
                <title>Info Screen</title>
            </Helmet>
            <h1 className="text-center my-5">Web Information</h1>
            <section class="alert alert-primary">
                <p><b>Port: </b></p>
                <p><b>Ops: </b></p>
                <p><b>Node Version: </b></p>
                <p><b>Memory Usage: </b></p>
                <p><b>Process id: </b></p>
                <p><b>Title: </b></p>
                <p><b>File Path: </b></p>
            </section>
        </div>
    )
}
