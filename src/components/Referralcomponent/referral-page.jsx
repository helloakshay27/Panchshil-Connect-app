import React from "react";
import "./referral.css";
import megaphoneImg1 from "../../components/Referralcomponent/Step 1.png";
import megaphoneImg2 from "../../components/Referralcomponent/Step 2.png";
import megaphoneImg3 from "../../components/Referralcomponent/Step 3.png";
import megaphoneImg4 from "../../components/Referralcomponent/Step 4.png";

const ReferralProcess = () => {
  return (
    <div className="container">
      {/* Step 1 */}
      <div className="step">
        <div className="step-content">
          <div className="step-number">Step 1</div>
          <h2 className="step-title">Refer someone</h2>
          <p className="step-description">
            Whether you want to purchase for self or refer your friends & family
            you could fill in relevant details & submit the referral.
          </p>
        </div>
        <div className="step-image">
          <img
            src={megaphoneImg1}
            alt="Megaphone"
            className="img-fluid"
            style={{ maxWidth: "120px" }}
          />
        </div>
      </div>

      {/* Step 2 */}
      <div className="step">
        <div className="step-content">
          <div className="step-number">Step 2</div>
          <h2 className="step-title">Refer processing</h2>
          <p className="step-description">
            Our brand partner based on your requirements will connect & explain
            the seamless process & benefits in detail.
          </p>
        </div>
        <div className="step-image">
          <img
            src={megaphoneImg2}
            alt="Megaphone"
            className="img-fluid"
            style={{ maxWidth: "120px" }}
          />
        </div>
      </div>

      {/* Step 3 */}
      <div className="step">
        <div className="step-content">
          <div className="step-number">Step 3</div>
          <h2 className="step-title">Showcase Offerings</h2>
          <p className="step-description">
            Relevant lifestyle projects will be shown, virtual tour & site visit
            would be facilitated & updated status would reflect in the app
          </p>
        </div>
        <div className="step-image">
          <img
            src={megaphoneImg3}
            alt="Megaphone"
            className="img-fluid"
            style={{ maxWidth: "120px" }}
          />
        </div>
      </div>

      {/* Step 4 */}
      <div className="step">
        <div className="step-content">
          <div className="step-number">Step 4</div>
          <h2 className="step-title">Deal Finalization</h2>
          <p className="step-description">
            Once all terms & conditions are agreed between both parties,
            developer representative
          </p>
        </div>
        <div className="step-image">
          <img
            src={megaphoneImg4}
            alt="Megaphone"
            className="img-fluid"
            style={{ maxWidth: "120px" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ReferralProcess;
