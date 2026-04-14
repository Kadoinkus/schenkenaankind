import {
  appCopy,
  homepageBenefits,
  homepageHero,
  homepageSteps,
  professionalTriggers,
  sourceLinks,
} from "../content/copy.js";
import AccordionItem from "../components/ui/AccordionItem.jsx";
import Button from "../components/ui/Button.jsx";
import Callout from "../components/ui/Callout.jsx";
import Icon from "../components/ui/Icon.jsx";
import SectionCard from "../components/ui/SectionCard.jsx";

const homeFaq = [
  {
    title: "Voor wie is deze tool bedoeld?",
    body:
      "Voor woningeigenaren en familieleden die eerst willen begrijpen welke richting ongeveer past, voordat zij juridisch of fiscaal advies inwinnen.",
  },
  {
    title: "Geeft deze tool advies?",
    body:
      "Nee. De tool maakt een indicatieve vergelijking op basis van vaste aannames. De uitkomst is een eerste oriëntatie en geen persoonlijk advies.",
  },
  {
    title: "Waarom staat er zoveel uitleg op de homepage?",
    body:
      "Omdat veel bezoekers eerst willen snappen wat de tool doet, welke vragen worden gesteld en wat zij daarna met de uitkomst kunnen doen.",
  },
];

export default function HomePage() {
  return (
    <div className="page-stack">
      <section className="hero">
        <div className="hero__content">
          <p className="intro-band__eyebrow">{appCopy.eyebrow}</p>
          <h1>{homepageHero.title}</h1>
          <p className="hero__lead">{homepageHero.body}</p>
          <div className="hero__actions">
            <a href="#berekening" className="button button--primary">
              <Icon name="play" size={16} />
              <span>Start berekening</span>
            </a>
            <a href="#uitleg" className="button">
              <Icon name="book" size={16} />
              <span>Lees eerst de uitleg</span>
            </a>
          </div>
          <p className="hero__note">
            Duidelijke eerste berekening, daarna pas de verdieping.
          </p>
        </div>
        <div className="hero__media">
          <img src={homepageHero.image} alt={homepageHero.imageAlt} />
        </div>
      </section>

      <section className="guidance-grid" aria-label="Waarom deze tool">
        {homepageBenefits.map((item) => (
          <article className="guidance-card" key={item.title}>
            <div className="guidance-card__icon guidance-card__icon--plain">
              <Icon name={item.icon} size={20} />
            </div>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <SectionCard
        eyebrow="Zo werkt het"
        title="In drie korte stappen naar een eerste uitkomst"
        subtitle="U hoeft geen fiscale expert te zijn. De tool leidt u stap voor stap door de invoer."
      >
        <div className="process-grid">
          {homepageSteps.map((item, index) => (
            <article className="process-step" key={item.title}>
              <div className="process-step__number">{index + 1}</div>
              <div className="process-step__content">
                <div className="process-step__icon">
                  <Icon name={item.icon} size={18} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      <section id="uitleg" className="info-grid">
        <article className="info-card">
          <h3>Wat u met deze tool kunt</h3>
          <p>
            U kunt drie routes naast elkaar zetten en zien wat de directe lasten en
            jaarlijkse aandachtspunten ongeveer zijn.
          </p>
        </article>
        <article className="info-card">
          <h3>Wat de tool niet doet</h3>
          <p>
            De tool vervangt geen notaris, fiscalist of testamentair advies. Hij helpt u
            vooral om beter voorbereid verder te gaan.
          </p>
        </article>
        <article className="info-card">
          <h3>Wanneer u direct hulp nodig hebt</h3>
          <p>
            Zodra de eigendom echt moet worden overgedragen of als er meerdere woningen,
            schenkingen of een afwijkende partnerregeling spelen.
          </p>
        </article>
      </section>

      <Callout title="Let op voordat u start" tone="warning" icon="alert">
        <p>{appCopy.disclaimer}</p>
      </Callout>

      <SectionCard
        eyebrow="Wanneer advies verstandig is"
        title="Situaties waarbij een standaardberekening meestal niet genoeg is"
      >
        <div className="trigger-list" role="list">
          {professionalTriggers.map((item) => (
            <div className="trigger-list__item" key={item} role="listitem">
              <Icon name="check" size={18} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Veelgestelde vragen"
        title="Korte antwoorden voor bezoekers die zich eerst willen oriënteren"
      >
        <div className="faq-list">
          {homeFaq.map((item) => (
            <AccordionItem key={item.title} title={item.title}>
              <p>{item.body}</p>
            </AccordionItem>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Bronnen"
        title="Publieke informatie waarop de uitgangspunten zijn gebaseerd"
      >
        <ul className="source-list">
          {sourceLinks.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
