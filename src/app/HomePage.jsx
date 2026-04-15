import {
  appCopy,
  homepageHero,
  homepageHighlights,
  homepageInteractiveTopics,
  homepageInteractiveVisual,
  homepageGallery,
  homepageRuleUpdate,
  homepageSteps,
  homepageTestimonial,
  sourceLinks,
} from "../content/copy.js";
import {
  AccordionItem,
  FeatureGrid,
  HeroBanner,
  Icon,
  PageSection,
  TimelineSteps,
  TopicSwitcher,
} from "../components/ui/index.js";

const homeFaq = [
  {
    title: "Voor wie is deze tool bedoeld?",
    body:
      "Voor ouders die eerst thuis willen begrijpen wat zij vanuit hun woning aan hun kind of kinderen kunnen meegeven, voordat zij verdere stappen zetten.",
  },
  {
    title: "Wat zie ik in de eerste berekening?",
    body:
      "U ziet hoe niets doen, in 1 keer schenken en jaarlijks schenken zich grofweg tot elkaar verhouden, en wat dat betekent voor wat nu of later naar uw kinderen gaat. De volledige uitwerking laat daarna de kostenopbouw en de jaartijdlijn zien.",
  },
  {
    title: "Waarom is uitleg zo belangrijk in deze tool?",
    body:
      "Omdat termen als vrijstelling, overdrachtsbelasting, box 3 en hypotheekrenteaftrek voor veel ouders pas waarde krijgen als duidelijk is wat ze betekenen voor wat hun kinderen uiteindelijk ontvangen.",
  },
  {
    title: "Wanneer is de volledige uitwerking vooral nuttig?",
    body:
      "Als u niet alleen wilt zien welke route gunstiger lijkt voor uw kinderen, maar ook precies wilt begrijpen welke kosten, belastingen en overdrachtsmomenten daarachter zitten.",
  },
];

const homepageFocusItems = homepageHighlights.map((item, index) => ({
  ...item,
  icon: ["shield", "family", "chart"][index] || "check",
}));

export default function HomePage() {
  return (
    <div className="page-stack page-stack--home">
      <HeroBanner
        eyebrow={appCopy.brand}
        title={homepageHero.title}
        description={homepageHero.body}
        image={homepageHero.image}
        imageAlt={homepageHero.imageAlt}
        signals={homepageHero.signals}
        actions={
          <>
            <a href="#berekening" className="button button--primary">
              <Icon name="play" size={16} />
              <span>Start berekening</span>
            </a>
            <a href="#uitleg" className="button">
              <Icon name="book" size={16} />
              <span>Hoe werkt het</span>
            </a>
          </>
        }
      />

      <PageSection
        eyebrow="Waarom ouders hiermee starten"
        title="Eerst zien wat u uw kinderen kunt meegeven"
        subtitle="U krijgt eerst helder wat schenken vanuit de woning ongeveer betekent voor uw kinderen, voor uzelf en voor de kosten."
        className="page-section--home-focus"
      >
        <FeatureGrid items={homepageFocusItems} />
      </PageSection>

      <PageSection
        eyebrow="Wat wilt u eerst weten?"
        title="Kies wat u voor uw kinderen eerst wilt begrijpen"
        subtitle="Begin met het onderwerp dat u als ouder nu het liefst helder wilt hebben."
        className="page-section--home-interactive"
      >
        <TopicSwitcher topics={homepageInteractiveTopics} />

        <aside className="home-interactive-visual">
          <div className="home-interactive-visual__media">
            <img
              src={homepageInteractiveVisual.image}
              alt={homepageInteractiveVisual.imageAlt}
            />
          </div>
          <p className="home-interactive-visual__caption">
            {homepageInteractiveVisual.caption}
          </p>
        </aside>
      </PageSection>

      <PageSection
        eyebrow={homepageTestimonial.eyebrow}
        title={homepageTestimonial.title}
        subtitle="Hoe een moeder van 2 kinderen eerst wilde begrijpen wat zij haar kinderen kon meegeven."
        className="page-section--home-proof"
      >
        <article className="home-proof" id="waarde">
          <div className="home-proof__media-wrap">
            <div className="home-proof__media">
              <img src={homepageTestimonial.image} alt={homepageTestimonial.imageAlt} />
            </div>
            <div className="home-proof__saving home-proof__saving--overlay">
              <span>{homepageTestimonial.savingLabel}</span>
              <strong>{homepageTestimonial.savingValue}</strong>
            </div>
          </div>

          <div className="home-proof__content">
            <div className="home-proof__intro">
              <figure className="home-proof__quote">
                <span className="home-proof__quote-mark" aria-hidden="true">
                  &ldquo;
                </span>
                <blockquote>{homepageTestimonial.intro}</blockquote>
                <figcaption className="home-proof__quote-attribution">
                  <strong>{homepageTestimonial.person}</strong>
                  <span>{homepageTestimonial.context}</span>
                </figcaption>
              </figure>
            </div>

            <div className="home-proof__accordion">
              {homepageTestimonial.interview.map((item, index) => (
                <AccordionItem
                  key={item.question}
                  title={item.question}
                  defaultOpen={index === 0}
                  className="home-proof__item"
                >
                  <p className="home-proof__answer">{item.answer}</p>
                </AccordionItem>
              ))}
            </div>
          </div>
        </article>
      </PageSection>

      <TimelineSteps
        id="uitleg"
        eyebrow="Zo werkt het voor ouders"
        title="In 3 rustige stappen naar inzicht voor u en uw kinderen"
        description="Van uw woning en hypotheek naar een eerste vergelijking van wat u uw kinderen nu of later kunt meegeven."
        steps={homepageSteps}
        image={homepageGallery.timelineImage.src}
        imageAlt={homepageGallery.timelineImage.alt}
        panelTitle="Wat u als ouder als eerste nodig hebt"
        panelBody="Met een paar basisgegevens ziet u al wat schenken vanuit de woning ongeveer kan betekenen voor uw kinderen."
        panelPoints={[
          "WOZ 2026 en hypotheek bij de hand",
          "Aantal kinderen en gezinssituatie invullen",
          "Daarna verschil voor uw kinderen bekijken",
        ]}
      />

      <PageSection
        eyebrow={homepageRuleUpdate.eyebrow}
        title={homepageRuleUpdate.title}
        subtitle={homepageRuleUpdate.subtitle}
        className="page-section--home-update"
      >
        <article className="home-update-story">
          <div className="home-update-story__content">
            <div className="home-update-story__meta">
              <p className="home-update-story__byline">{homepageRuleUpdate.byline}</p>
              <span className="home-update-story__separator" aria-hidden="true">
                /
              </span>
              <p className="home-update-story__date">{homepageRuleUpdate.dateLabel}</p>
            </div>

            <p className="home-update-story__lede">{homepageRuleUpdate.lede}</p>

            <div className="home-update-story__body">
              {homepageRuleUpdate.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <p className="home-update-story__summary">
              <strong>{homepageRuleUpdate.summaryLabel}:</strong>{" "}
              {homepageRuleUpdate.summaryText}
            </p>

            <div className="home-update-story__actions">
              <a href="#berekening" className="button button--primary">
                <Icon name="play" size={16} />
                <span>{homepageRuleUpdate.ctaLabel}</span>
              </a>
              <a
                href={homepageRuleUpdate.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="home-update-story__source-link"
              >
                {homepageRuleUpdate.sourceLabel}
              </a>
            </div>
          </div>

          <aside className="home-update-story__media">
            <img
              src={homepageRuleUpdate.image}
              alt={homepageRuleUpdate.imageAlt}
            />
          </aside>
        </article>
      </PageSection>

      <PageSection
        eyebrow="Veelgestelde vragen"
        title="Korte antwoorden voor ouders voordat zij beginnen"
        subtitle="Alleen de vragen die ouders meestal eerst willen kunnen plaatsen."
        className="page-section--faq"
      >
        <div className="faq-list">
          {homeFaq.map((item) => (
            <AccordionItem key={item.title} title={item.title}>
              <p>{item.body}</p>
            </AccordionItem>
          ))}
        </div>

        <AccordionItem title="Bronnen en uitgangspunten">
          <ul className="source-list">
            {sourceLinks.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </AccordionItem>
      </PageSection>
    </div>
  );
}
