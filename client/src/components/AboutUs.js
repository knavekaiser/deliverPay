import { Header, Footer } from "./Elements";
require("./styles/generic.scss");

const AboutUs = () => {
  return (
    <div className="generic aboutUs">
      <Header />
      <div className="content">
        <h1>About Us</h1>
        <section>
          <h3>title</h3>
          <p>paragraph</p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;
