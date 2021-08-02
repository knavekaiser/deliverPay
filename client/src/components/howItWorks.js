import { Header, Footer } from "./Elements";

const HowItWorks = () => {
  return (
    <div className="generic howItWorks">
      <Header />
      <div className="content">
        <h1>How it Works</h1>
        <section>
          <img src="/how_it_works.png" />
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default HowItWorks;
