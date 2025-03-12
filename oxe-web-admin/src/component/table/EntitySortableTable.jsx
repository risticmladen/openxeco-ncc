import React from "react";
import {
	useTable,
	usePagination,
	useFlexLayout,
	useSortBy,
} from "react-table";
import "./EntitySortableTable.css";

export default function EntitySortableTable({
	keyBase,
	columns,
	data,
	height,
	showBottomBar,
	defaultSortedHeaderId, // New prop for default sorted header ID
}) {
	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		prepareRow,
		page,
		canPreviousPage,
		canNextPage,
		pageOptions,
		pageCount,
		gotoPage,
		nextPage,
		previousPage,
		setPageSize,
		state: { pageIndex, pageSize },
	} = useTable(
		{
			columns,
			data,
			height,
			showBottomBar,
			initialState: {
				pageIndex: 0,
				sortBy: defaultSortedHeaderId
					? [{ id: defaultSortedHeaderId, desc: false }]
					: [],
			},
		},
		useSortBy,
		usePagination,
		useFlexLayout,
	);

	const getSortByTogglePropsWithState = (column) => {
		const defaultSortByToggleProps = column.getSortByToggleProps();
		return {
			...defaultSortByToggleProps,
			onClick: (e) => {
				e.preventDefault();
				column.toggleSortBy(!column.isSortedDesc);
				headerGroups.forEach((headerGroup) => {
					headerGroup.headers.forEach((otherColumn) => {
						if (otherColumn !== column) {
							otherColumn.clearSortBy();
						}
					});
				});
			},
		};
	};

	return (
		<div className="Table">
			<table {...getTableProps()}>
				<thead>
					{headerGroups.map((headerGroup, i) => (
						<tr {...headerGroup.getHeaderGroupProps()} key={keyBase + "-" + i}>
							{headerGroup.headers.map((column, y) => (
								<th
									{...column.getHeaderProps(getSortByTogglePropsWithState(column))}
									key={keyBase + "-" + i + "-" + y}
								>
									{column.render("Header")}
									{column.canSort && (
										<span>
											{column.isSorted
												? column.isSortedDesc
													? " 🔽"
													: " 🔼"
												: null}
										</span>
									)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody {...getTableBodyProps()}>
					{page.map((row, i) => {
						prepareRow(row);
						return (
							<tr {...row.getRowProps()} key={keyBase + "-" + i}>
								{row.cells.map((cell, y) => (
									<td {...cell.getCellProps()} key={keyBase + "-" + i + "-" + y}>
										{cell.render("Cell")}
									</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</table>
			<div className="Table-pagination">
				<div className="Table-pagination-center">
					<span>
						Page{" "}
						<strong>
							{pageIndex + 1} of {pageOptions.length}
						</strong>{" "}
					</span>
					{showBottomBar ? (
						<span>
							| Go to page:{" "}
							<input
								type="number"
								defaultValue={pageIndex + 1}
								onChange={(e) => {
									const page2 = e.target.value ? Number(e.target.value) - 1 : 0;
									gotoPage(page2);
								}}
								style={{ width: "100px" }}
							/>
						</span>
					) : (
						""
					)}
					{typeof height === "undefined" && showBottomBar ? (
						<select
							value={pageSize}
							onChange={(e) => {
								setPageSize(Number(e.target.value));
							}}
						>
							{[10, 20, 50].map((ps) => (
								<option key={ps} value={ps}>
									Show {ps}
								</option>
							))}
						</select>
					) : (
						""
					)}
				</div>
				<div className="Table-pagination-button-left">
					<button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
						{"<<"}
					</button>{" "}
					<button onClick={() => previousPage()} disabled={!canPreviousPage}>
						{"<"}
					</button>{" "}
				</div>
				<div className="Table-pagination-button-right">
					<button onClick={() => nextPage()} disabled={!canNextPage}>
						{">"}
					</button>{" "}
					<button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
						{">>"}
					</button>{" "}
				</div>
			</div>
		</div>
	);
}
