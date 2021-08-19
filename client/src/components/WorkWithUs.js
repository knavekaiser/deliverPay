import { useState } from "react";
import { Header, Footer, Img } from "./Elements";
import { Link } from "react-router-dom";
require("./styles/WorkWithUs.scss");

const WorkWithUs = () => {
  return (
    <div className="generic workWithUs">
      <Header />
      <main>
        <div className="header">
          <h1>Delivery Pay</h1>
          <p className="subtitle">Never Pay Without Using Delivery pay</p>
        </div>
        <div className="hero">
          <Img src="https://static.wixstatic.com/media/11062b_010acefdfeb1461f8a79a7b3640e5685~mv2.jpg/v1/fill/w_671,h_650,al_c,q_85,usm_0.66_1.00_0.01/11062b_010acefdfeb1461f8a79a7b3640e5685~mv2.webp" />
          <div className="detail">
            <div>
              <h2>
                WORK
                <br /> WITH <span>US</span>
              </h2>
              <p>
                We are always looking to add talent to our Teams.
                <br />
                Below is a list of Job Openings We have At This Time
              </p>
            </div>
          </div>
        </div>
        <div className="faq">
          <h3>Let's Start With Answering Your Questions & Concern</h3>
          <ul>
            <Faq n="01" ques="Are There Any Charges Associated With Hiring?">
              <div className="ans">
                <p>NO.</p>
                <p>
                  There are No Charges Associated with Hiring for Beautiful
                  Concepts.
                </p>
                <p>
                  Incase you receive any such request, Please email us details
                  at support@deliverypay.in.
                </p>
              </div>
            </Faq>
            <Faq n="02" ques="Are There Any Work From Home Options?">
              <div className="ans">
                <p>YES.</p>
                <p>
                  At this Point All of our Job Opportunities at for Work From
                  Home Only.
                </p>
              </div>
            </Faq>
            <Faq
              n="03"
              ques="Do I need to come to the office for my interviews?"
            >
              <div className="ans">
                <p>
                  NO, At Present we are Not Conducting any In-Person Interviews.
                </p>
                <p>
                  All Short Listed Candidates are emailed an Invitation For An
                  Interview along with Scheduling Links and Instructions.
                </p>
              </div>
            </Faq>
            <Faq
              n="04"
              ques="Will the company provide me with a computer system & reimbursements?"
            >
              <div className="ans">
                <p>NO.</p>
                <p>
                  New Employees are required to have their own Computers /
                  Desktops A Dedicated Area To Work Broadband / Wifi Internet
                </p>
                <p>
                  The Company Provides Work Training & In-Hand Salaries Only For
                  Work From Home Employees.
                </p>
              </div>
            </Faq>
            <Faq n="05" ques="Is There A Training Period?">
              <div className="ans">
                <p>Yes.</p>
                <p>
                  Each Selected Candidate must Undergo a 15 Day Training / Trial
                  Period.
                </p>
              </div>
            </Faq>
            <Faq n="06" ques="Is The Training Period Paid or Un-Paid?">
              <div className="ans">
                <p>The Training Period is Paid.</p>
              </div>
            </Faq>
            <Faq n="07" ques="Is There Any Bond That Needs To Be Signed?">
              <div className="ans">
                <p>
                  We Do Not Have Any Bonds That Need to Be Signed. All Employees
                  are free to leave at any point by providing us with a
                  resignation letter.
                </p>
                <p>
                  HOWEVER, We do have a Work Contract that Includes Terms of
                  Employment, Payment Details, Etc. The Minimum Term of Work
                  Contract is 6 Months.
                </p>
              </div>
            </Faq>
            <Faq n="08" ques="What is the Term of the Work Contract?">
              <div className="ans">
                <p>
                  We Expect Candidates to Work With Us For A Minimum Period Of 6
                  Months.
                </p>
                <p>Employee's are Free to Resign At Any Time.</p>
              </div>
            </Faq>
            <Faq n="09" ques="What Happens If I Resign Before 6 Months?">
              <div className="ans">
                <p>
                  If an Employee Needs To Resign Before 6 Months, He/She can
                  simply email a resignation letter to support@deliverypay.in 45
                  Days prior to leaving.
                </p>
                <p>
                  The company withholds the 1st 15 days pay of the training
                  period as security deposit, if for any reason any employee
                  does not complete their 6 months duration the company reserves
                  the right to forfeit the deposit.
                </p>
                <p>
                  Candidates who are prone to jumping jobs and are looking for
                  temporary jobs are not our ideal candidates.
                </p>
              </div>
            </Faq>
          </ul>
        </div>
        <div className="cla">
          <div className="wrapper">
            <h3>When in Doubt Ask</h3>
            <p>
              We are always Happy to answer any other questions you may have -
              WhatsApp us at +91 9557059871 or Email us at
              support@deliverypay.in
            </p>
          </div>
        </div>
        <ul className="jobs">
          <li>
            <h4 className="jobTitle">Business Development Executives</h4>
            <div className="body">
              <Link className="link" to="/apply">
                Apply
              </Link>
              <div className="dscr">
                <p>
                  As A Business Development Executive your role would be to
                  Understand & Handle the Clients requirements.
                </p>
                <p>A Firm Grasp over English is Mandatory</p>
                <p>Responsibilities and Duties</p>
                <p>
                  As BDE your tasks would include speaking with clients,
                  understanding their requirements & then ensuring that their
                  requirements are fulfilled.
                </p>
                <p>You will work closely with the Operations Team.</p>
                <p>
                  You should be comfortable with working on a Rotational Shift
                  Basis.
                </p>
              </div>
            </div>
          </li>
          <li>
            <h4 className="jobTitle">Executive Administrative Assistant</h4>
            <div className="body">
              <Link className="link" to="/apply">
                Apply
              </Link>
              <div className="dscr">
                <p>
                  MBA Finance / B.B.A / B.Com / Commerce Stream Candidates
                  preffered Proficiency in English IS A MUST.
                </p>
                <p>Freshers Can Apply ONLY IF YOU MEET THE CRITERIA.</p>
                <p>Job Description</p>
                <p>
                  As an Executive Administrative Assistant We are looking for
                  candidates who can work with our Clients in the United States
                  & Canada & work as a Part of their Office in India.
                </p>
                <p>
                  As an Executive Administrative Assistant your responsibilities
                  will Include
                </p>
                <ul>
                  <li>
                    Being Trained for their In-House work requirements via Video
                    Conferencing, Email & Over the Phone. Learning & Working
                    according to US Work Culture based in Real Time USA / Canada
                    .
                  </li>
                  <li>
                    Receiving Daily To-Do Lists from the Office and Completing
                    Tasks as Required with Precision & Efficiency.
                  </li>
                  <li>
                    Being Point of Contact for Supervisors and Managers - Noting
                    Work/Tasks that needs to be Completed on their In-House
                    Softwares for Customer Success.
                  </li>
                  <li>
                    Completing work on MS Office Applications such as Outlook,
                    Excel & Word.
                  </li>
                  <li>Communicating in Fluent English - Written and Verbal.</li>
                  <li>
                    You should be able to Organise Files and Folders in a
                    Systematic Method & Quickly Retrieve them when Required.
                  </li>
                  <li>
                    Collaborate with your Project Manager in India and Follow
                    Instructions as Provided.
                  </li>
                  <li>
                    Ultimately, you should be able to handle administrative
                    projects and deliver high-quality work under minimum
                    supervision.
                  </li>
                </ul>
                <p>Responsibilities</p>
                <ul>
                  <li>
                    Preparing regular financial and administrative reports
                  </li>
                  <li>
                    Undertaking the tasks of making calls, take messages and
                    routing correspondence
                  </li>
                  <li>
                    Prepare regular reports on expenses and office budgets
                  </li>
                  <li>Maintain and update company databases</li>
                  <li>Organize client’s calendars</li>
                  <li>Perform market research</li>
                  <li>Reviewing financial statements</li>
                  <li>
                    Organize a filing system for important and confidential
                    company documents
                  </li>
                  <li>Answer queries by employees and clients</li>
                  <li>Update office policies as needed</li>
                  <li>Maintain a company calendar and schedule appointments</li>
                  <li>Book meeting rooms as required</li>
                  <li>
                    Distribute and store correspondence (e.g. letters, emails
                    and packages)
                  </li>
                  <li>
                    Prepare reports and presentations with statistical data, as
                    assigned
                  </li>
                  <li>Arrange travel and accommodations</li>
                  <li>Schedule in-house and external events</li>
                </ul>
                <p>Requirements</p>
                <ul>
                  <li>
                    Proven work experience as an Administrative Officer,
                    Administration
                  </li>
                  <li>
                    Experience with office management software like MS Office
                    (MS Excel and MS Word, specifically)
                  </li>
                  <li>
                    Strong organization skills with a problem-solving attitude
                  </li>
                  <li>Excellent written and verbal communication skills</li>
                  <li>Attention to detail</li>
                  <li>
                    MBA Finance / BBA / B.Com / Commerce Stream Candidates
                    Prefered *
                  </li>
                  <li>Proficiency in English*</li>
                  <li>Exemplary planning and time management skills</li>
                  <li>
                    Up-to-date with advancements in office gadgets and
                    applications
                  </li>
                  <li>Ability to multitask and prioritize daily workload</li>
                </ul>
              </div>
            </div>
          </li>
          <li>
            <h4 className="jobTitle">Node js developer</h4>
            <div className="body">
              <Link className="link" to="/apply">
                Apply
              </Link>
              <div className="dscr">
                <p>
                  We are looking for a Great Node Developer who can work with
                  our Team:
                </p>
                <p>
                  You would be working as a Backend developer, You Need to Have
                  In-Depth Knowledge of node.js framework, express js,
                  proficiency in Restful APIs and API communication, database
                  scheme creation, knowledge of user authentication and
                  authorization, efficiency in code, implementing data
                  protection, error handling, familiar with MVC framework,
                  Please Note We Work on Mongodb ONLY. This is a Permanent Work
                  From Home Job. Freshers with In-Depth Knowledge Can Apply.
                  Trainees & Interns Please Skip.
                </p>
              </div>
            </div>
          </li>
        </ul>
      </main>
      <Footer />
    </div>
  );
};

const Faq = ({ n, ques, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <li className={open ? "open" : ""}>
      <div className="head" onClick={() => setOpen(!open)}>
        <p className="n">{n}</p>
        <p className="ques">{ques}</p>
      </div>
      <div className="body">{children}</div>
    </li>
  );
};

export default WorkWithUs;
