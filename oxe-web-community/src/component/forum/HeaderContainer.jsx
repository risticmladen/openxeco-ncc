import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import Navlink from "./navlink";
import "./HeaderContainer.css";

const HeaderContainer = () => (
	<div className="headerContainer">
		<div className="navlinksContainer">
			<div className="logosContainer">
				<div>
					<span className="logoWrapper">
						<a href="https://ncc.cy">
							<img
								src="/img/ncc-logo.png"
								className="ncc-logo"
								alt="ncc cy logo"
							/>
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
				<div className="contactsWrapper">
					<span className="contactContainer">
						<FontAwesomeIcon icon={faEnvelope} color="#3679BE"/>
						<a href="mailto:info@ncc.cy">
								INFO@NCC.CY</a>
					</span>
					<span className="contactContainer">
						<FontAwesomeIcon icon={faPhone} color="#3679BE"/>
						<a href="tel:+35722693150">
								+357 22 693 150</a>
					</span>

				</div>
			</div>

			<Navlink />
		</div>

	</div>
);

export default HeaderContainer;
