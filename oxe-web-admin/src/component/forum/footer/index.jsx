import React from "react";
import "./styles.css";

const FooterContainer = () => (
	<div className="footerContainer">
		<div className="navlinksFooterContainer ">
			<div className="footerLogosContainer">
				<span className="logoWrapper logoNccWrapper">
					<a href="https://ncc.cy">
						<img src="/img/ncc-logo.png" className="ncc-logo" alt="ncc cy logo" />
					</a>
				</span>
				<span className="logoWrapper">
					<a href="https://dsa.cy">
						<img
							src="/img/commissioner-logo.png"
							className="commisioner-logo"
							alt="commissioner of communication logo"
						/>
					</a>
				</span>
			</div>
			<div className="footerContactContainer">
				<div className="contactsContainer">
					<h3>Useful links</h3>
					<ul>
						<li>
							<a href="https://ncc.cy/contact-us">Contact us</a>
						</li>
						<li>
							<a href="https://ncc.cy/">NCC</a>
						</li>
					</ul>
				</div>
				<div className="contactsContainer followContainer">
					<h3>Follow us</h3>
					<div className="socialContainer">
						<a href="https://www.facebook.com/NCCcyprus/?_rdr">
							<span className="socialIcon iconFb" />
						</a>
						<a href="https://x.com/NCC_cy">
							<span className="socialIcon iconTwitter" />
						</a>
						<a href="https://www.linkedin.com/company/unavailable/">
							<span className="socialIcon iconLinkedin" />
						</a>
					</div>
				</div>
			</div>
		</div>
		<div className="euBottomWrapper">
			<span className="euLogoContainer">
				<img
					src="/img/co-fundedEU-logo.png"
					alt="co-funded EU logo black & white"
				/>
			</span>
			<span>
				<p>
  This project has received funding from the European Union’s Digital Programme under Grant
  Agreement № 101101331. The project is supported by the European Union’s DG Connect Digital
  Europe Programme and its members Digital Security Authority, Research and Innovation
  Foundation, and Deputy Ministry of Research, Innovation and Digital Policy.
				</p>

			</span>
		</div>
	</div>
);

export default FooterContainer;
