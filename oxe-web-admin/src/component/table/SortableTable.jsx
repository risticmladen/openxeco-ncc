import React from "react";
import {
	useTable,
	usePagination,
	useFlexLayout,
	useSortBy,
} from "react-table";
import "./Table.css";
import "./SortableTable.css";

export default function SortableTable({
	columns, data, pagination, changePage, height, showBottomBar,
}) {
	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		prepareRow,
		page,
		setPageSize,
		state: {
			pageSize,
		},
	} = useTable(
		{
			columns,
			data,
			initialState: {
				pageIndex: 0,
				pageSize: pagination.per_page,
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
				if (column.isSorted && column.isSortedDesc) {
					column.toggleSortBy(false);  // Switch to ascending
				} else {
					column.toggleSortBy(true);   // Switch to descending
				}
			},
		};
	};

	return (
		<div>
			<div className="Table-content">
				<table {...getTableProps()}>
					<thead>
						{headerGroups.map((headerGroup, i) => (
							<tr {...headerGroup.getHeaderGroupProps()} key={i}>
								{headerGroup.headers.map((column, j) => (
									<th {...column.getHeaderProps(getSortByTogglePropsWithState(column))} key={j}>
										{column.render("Header")}
										{column.canSort && (
											<span>
												{column.isSorted
													? column.isSortedDesc
														? " 🔽"
														: " 🔼"
													: " 🔼"}
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
								<tr {...row.getRowProps()} key={i}>
									{row.cells.map((cell, j) => <td {...cell.getCellProps()} key={j}>
										{cell.render("Cell")}
									</td>)}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			<div className="Table-pagination">
				<div className="Table-pagination-center">
					<span>
						Page{" "}
						<strong>
							{pagination.page} of {pagination.pages}
						</strong>{" "}
					</span>

					{typeof height === "undefined" && showBottomBar
						? <select
							value={pageSize}
							onChange={(e) => {
								setPageSize(Number(e.target.value));
							}}
						>
							{// eslint-disable-next-line arrow-body-style
							}{[10, 20, 50].map((ps) => {
								return (
									<option key={ps} value={ps}>
										Show {ps}
									</option>
								);
							})}
						</select>
						: ""
					}
				</div>

				<div className="Table-pagination-button-left">
					<button
						onClick={() => changePage(1)}
						disabled={pagination.page <= 1}>
						{"<<"}
					</button>{" "}
					<button
						onClick={() => changePage(pagination.page - 1)}
						disabled={pagination.page <= 1}>
						{"<"}
					</button>{" "}
				</div>

				<div className="Table-pagination-button-right">
					<button
						onClick={() => changePage(pagination.page + 1)}
						disabled={pagination.page >= pagination.pages}>
						{">"}
					</button>{" "}
					<button
						onClick={() => changePage(pagination.pages)}
						disabled={pagination.page >= pagination.pages}>
						{">>"}
					</button>{" "}
				</div>
			</div>
		</div>
	);
}
