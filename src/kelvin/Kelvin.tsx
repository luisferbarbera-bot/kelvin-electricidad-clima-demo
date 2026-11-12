"use client";
import * as React from "react";
import { LangProvider, useCopy } from "./lang";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Services, TrustStrip } from "./Services";
import { Process, Projects, Testimonials, Why } from "./Proof";
import { Contact, Footer, Quote, type QuotePreset } from "./Quote";

function DemoBar() {
  const { t } = useCopy();
  return <p className="gutter bg-aire py-1.5 text-center font-mono text-[11px] font-medium text-tinta">{t.demoBar}</p>;
}

function Page() {
  const [preset, setPreset] = React.useState<QuotePreset>(null);
  return (
    <>
      <DemoBar />
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <Services onRequest={(div, code) => setPreset({ div, code })} />
        <Why />
        <Process />
        <Projects />
        <Testimonials />
        <Quote preset={preset} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default function Kelvin() {
  return (
    <LangProvider>
      <Page />
    </LangProvider>
  );
}
