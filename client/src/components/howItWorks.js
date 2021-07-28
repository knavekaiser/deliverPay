import { Header, Footer } from "./Elements";
require("./styles/generic.scss");

const HowItWorks = () => {
  return (
    <div className="generic howItWorks">
      <Header />
      <div className="content">
        <h1>How it Works</h1>
        <section>
          <h3>title</h3>
          <p>paragraph</p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default HowItWorks;
