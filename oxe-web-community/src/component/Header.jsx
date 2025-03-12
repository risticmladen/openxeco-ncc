import React from "react";
import "./Header.css";

function Header() {
	return (
		<div className="header">
			<div className="header-content">
				<div className="header-left mt-3">
					<img src="/img/NCCC Logo English.png" className="logo-first-header" alt="Logo" />
					<img src="/img/logo_3_ENG.png" className="logo-second-header ml-n5" alt="Logo" />
				</div>
				<div className="header-right mt-3">
					<div className="contact-info">
						{/* <span className="mr-2"><i className="fas fa-search"></i> Search</span> */}
						<span className="mr-2"><i className="fas fa-envelope"></i> community@ncc.cy</span>
						<span className="mr-2"><i className="fas fa-phone"></i> 1447</span>
					</div>
					<div className="main-menu mt-5">
						<ul>
							<li><a href="">Home</a></li>
							<li><a href="https://ncc.cy/newsroom" target="_blank" rel="noopener noreferrer">News</a></li>
							<li><a href="https://dsa.cy/" target="_blank" rel="noopener noreferrer">DSA</a></li>
							<li><a href="https://ncc.cy/" target="_blank" rel="noopener noreferrer">NCC</a></li>
							<li><a href="https://ncc.cy/contact-us" target="_blank" rel="noopener noreferrer">Contact</a></li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Header;
