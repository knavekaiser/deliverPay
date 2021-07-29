import { Header, Footer } from "./Elements";
require("./styles/contactUs.scss");

const AboutUs = () => {
  return (
    <div className="generic aboutUs">
      <Header />
      <div className="content">
        <h1>About Us</h1>
        <section>
          <h3>ABOUT</h3>
          <p>
            Started in 2019, Beautiful Concepts Pvt Ltd. has had the privilege
            of working with great clients & minds from across the world via its
            Various Brand Names & Companies like HandicraftsCompany.Com,
            AssistantsCompany.Com, EdisonTesla Company & Now DeliveryPay.In
          </p>
          <p>
            Our Emphasis & Core focus has always been around ensuring innovation
            & improvement on the existing systems, Services & Products Available
            to our Clients
          </p>
        </section>
        <section>
          <h3>HISTORY</h3>
          <p>
            Founded by the Khanna Family - Earlier known as Sunbeam Arun Khanna
            & Arun Overseas with its Heritage Dating Back to 1952. Being 3rd
            Generation in Business the Family has accumulated a wealth of
            information and Designs & has created extremely competitive rates, a
            well-organized system and High Quality, that have added much to the
            marketability of our products. We offer a large ensemble of
            Exquisitely Designed Products that are available in a variety of
            finishes.
          </p>
        </section>
        <section>
          <h3>THE Story - Short Version</h3>
          <p>
            It started when Our Founder’s Daughter one day decided to buy
            clothes from a link she found on social media with great reviews,
            promising prompt delivery & return guarantee. 20 days later, she
            approached the vendor who told her he had shipped them & should get
            them soon, 40 days later she still hadn’t received it & wanted a
            refund. with thVendor no longer responding she spoke to her friends
            & they all reported a similar incident every so often.
          </p>
          <p>
            With Business Acumen built into their DNA, the founders saw an
            opportunity & DeliveryPay was born.
          </p>
        </section>
        <section>
          <h3>Beautiful Concepts Pvt. Ltd.</h3>
          <p>
            Located at C2, Sector 1 in Noida Our Team Works Relentlessly to
            Provide Flawless Services to our Clients.
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;
