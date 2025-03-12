import React from "react";
import "./FormLine.css";
import * as moment from "moment";
import "react-datetime/css/react-datetime.css";
import Select from "react-select";
import Editor from "react-medium-editor";
import Datetime from "react-datetime";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import _ from "lodash";
import Chip from "./Chip.jsx";
import CheckBox from "./CheckBox.jsx";

function getSelectStyle() {
	return {
		input: () => ({
			height: "32px !important",
		}),
		control: (base, state) => ({
			...base,
			border: state.isFocused ? "2px solid #000 !important" : "2px solid lightgrey !important",
			boxShadow: 0,
		}),
		singleValue: (base) => ({
			...base,
			color: "inherit !important",
		}),
	};
}

export default class FormLine extends React.Component {
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.getFormatClassName = this.getFormatClassName.bind(this);
		this.addValue = this.addValue.bind(this);
		this.deleteValue = this.deleteValue.bind(this);
		this.getField = this.getField.bind(this);

		this.state = {
			value: props.value || "",  // Default to an empty string to prevent null
		};
	}

	componentDidUpdate(prevProps) {
		if (prevProps.value !== this.props.value) {
			this.setState({ value: this.props.value || "" });  // Ensure the value is never null
		}
	}

	onClick() {
		const newState = !this.props.value;
		if (typeof this.props.onClick !== "undefined" && this.props.disabled !== true) this.props.onClick(newState);
	}

	onChange(value) {
		this.setState({ value });

		if (typeof this.props.onChange !== "undefined") this.props.onChange(value);
	}

	onBlur(value) {
		if (typeof this.props.onBlur !== "undefined") this.props.onBlur(value);
	}

	addValue(valueToAdd) {
		if (this.state.value.indexOf(valueToAdd) < 0) {
			const value = _.cloneDeep(this.state.value);
			value.push(valueToAdd);
			this.setState({ value });
			this.props.onChange(value);
		}
	}

	deleteValue(valueToDelete) {
		let value = _.cloneDeep(this.state.value);
		value = value.filter((v) => v !== valueToDelete);
		this.setState({ value });
		this.props.onChange(value);
	}

	getFormatClassName() {
		if (this.props.format === undefined || this.props.value === "") {
			return "";
		}
		if (this.props.format(this.state.value)) return "FormLine-right-format";
		return "FormLine-wrong-format";
	}

	getField() {
		switch (this.props.type) {
			case "textarea":
				return <textarea
					value={this.state.value || ""}  // Ensure the value is never null
					onChange={(v) => this.onChange(v.target.value)}
					onBlur={(v) => this.onBlur(v.target.value)}
					disabled={this.props.disabled}
					autoFocus={this.props.autofocus}
					onKeyDown={this.props.onKeyDown}
				/>;
			case "checkbox":
				return <CheckBox
					label={this.props.innerLabel}
					value={this.state.value || false}  // Ensure the value is never null
					onClick={(v) => this.onChange(v)}
					disabled={this.props.disabled}
					background={this.props.background}
				/>;
			case "select":
				return <Select
					value={{
						label: this.props.options
							.filter((o) => o.value === this.state.value).length > 0
							? this.props.options.filter((o) => o.value === this.state.value)[0].label
							: this.state.value || "",
						value: this.state.value || "",
					}}
					styles={getSelectStyle()}
					options={this.props.options}
					onChange={(v) => this.onChange(v.value)}
					isDisabled={this.props.disabled}
				/>;
			case "multiselect":
				return <div>
					<Select
						value={null}
						styles={getSelectStyle()}
						options={this.props.options}
						onChange={(v) => this.addValue(v.value)}
					/>
					<div className="FormLine-chips">
						{(Array.isArray(this.state.value) ? this.state.value : []).map((o) => (
							<Chip
								key={o}
								label={this.props.options.filter((op) => op.value === o)[0].label}
								value={o}
								onClick={(v) => this.deleteValue(v)}
							/>
						))}
					</div>
				</div>;
			case "country":
				return <CountryDropdown
					className={this.getFormatClassName()}
					value={this.state.value || ""}  // Ensure the value is never null
					onChange={(value) => this.onChange(value)}
				/>;
			case "editor":
				return <Editor
					className={"medium-editor-element " + this.getFormatClassName()}
					text={this.state.value || ""}  // Ensure the value is never null
					onChange={(v) => this.onChange(v)}
					onBlur={() => this.onBlur(this.state.value || "")}
					options={{
						toolbar: { buttons: ["bold", "italic", "underline", "anchor", "quote", "unorderedlist"] },
						placeholder: { text: "" },
					}}
				/>;
			case "region":
				return <RegionDropdown
					className={this.getFormatClassName()}
					country={this.props.country}
					value={this.state.value || ""}  // Ensure the value is never null
					onChange={(value) => this.onChange(value)}
				/>;
			case "datetime":
				return <Datetime
					className={this.getFormatClassName()}
					value={this.state.value === null ? null : moment(this.state.value)}  // Allow null for datetime picker
					onChange={(v) => this.onChange(v)}
					onClose={() => this.onBlur(this.state.value || "")}
					disabled={this.props.disabled}
					autoFocus={this.props.autofocus}
					onKeyDown={this.props.onKeyDown}
					dateFormat={"YYYY-MM-DD"}
					timeFormat={"HH:mm"}
				/>;
			default:
				return <input
					className={this.getFormatClassName()}
					type={this.props.type || "text"}
					value={this.state.value || ""}  // Ensure the value is never null
					onChange={(v) => this.onChange(v.target.value)}
					onBlur={(v) => this.onBlur(v.target.value)}
					disabled={this.props.disabled}
					autoFocus={this.props.autofocus}
					onKeyDown={this.props.onKeyDown}
				/>;
		}
	}

	render() {
		let labelWidth = null;
		let fieldWidth = null;

		if (this.props.fullWidth) {
			labelWidth = "col-md-12";
			fieldWidth = "col-md-12";
		} else {
			labelWidth = "col-md-" + (this.props.labelWidth ? this.props.labelWidth : 6);
			fieldWidth = "col-md-" + (this.props.labelWidth ? 12 - this.props.labelWidth : 6);
		}

		return (
			<div className={"FormLine"}>
				<div className={"row"}>
					<div className={labelWidth}>
						<div className={"FormLine-label"}>
							{this.props.label}
						</div>
					</div>
					<div className={fieldWidth}>
						{this.getField()}
					</div>
				</div>
			</div>
		);
	}
}
