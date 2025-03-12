import React from "react";
import { Link } from "react-router-dom";
import "./styles.css";

const Navlink = () => (
	<div className="navlinkContainer">
		<div className="link">
			<Link to="/">HOME</Link>
		</div>
		<div className="link">
			<Link to="#">NEWS</Link>
		</div>
		<div className="link">
			{/* <Link to="/">DSA</Link> */}
			<a href="https://dsa.cy">DSA</a>
		</div>
		<div className="link">
			{/* <Link to="/">NCC</Link> */}
			<a href="https://ncc.cy/"> NCC</a>
		</div>
		<div className="contactLink link">
			<Link to="/contact">CONTACT</Link>
		</div>
	</div>
);

export default Navlink;
