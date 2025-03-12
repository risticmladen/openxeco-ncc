import React from "react";
import "./Footer.css";

function Footer() {
	return (
		<div className="footer">
			<div className="footer-content">
				<div className="footer-left">
					<img src="/img/NCCC Logo English.png" className="logo-first-footer" alt="Logo" />
					<img src="/img/logo_3_ENG.png" className="logo-second-footer ml-n5" alt="Logo" />
				</div>
				<div className="footer-right">
					<div className="row">
						<div className="left-menu">
							<h5><strong>Useful Links</strong></h5>
							<ul className="links-options">
								<li>Home</li>
								<li>Community</li>
							</ul>
						</div>
						<div className="right-menu">
							<h5><strong>Follow Us</strong></h5>
							<div className="social-icons">
								<a href="https://www.facebook.com/NCCcyprus/?_rdr" target="_blank "rel="noreferrer"><i className="fab fa-facebook-square"></i></a>
								<a href="https://x.com/NCC_cy" target="_blank "rel="noreferrer"><i className="fab fa-twitter-square"></i></a>
								<a href="https://www.linkedin.com/company/unavailable/" target="_blank "rel="noreferrer"><i className="fab fa-linkedin"></i></a>
							</div>
						</div>
					</div>
				</div>
			</div>
			<hr className="footer-separator" />
			<div className="footer-bottom">
				<img src="/img/eu_footer.png" className="footer-image" alt="Footer Image" />
				<p className="footer-text">This project has received funding from the European Unions Digital Program under Grant Agreement No. 101101331. The project is supported by the European Unions Digital Europe Program and its members are the Digital Security Authority, the Research and Innovation Foundation and the Ministry of Research, Innovation and Digital Policy.</p>
			</div>
		</div>
	);
}

export default Footer;
