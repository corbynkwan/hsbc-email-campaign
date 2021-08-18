import React from "react";
import { Link } from "react-router-dom";
import $ from 'jquery';

/**  
 * 
 * @param {Array} data is in the form of
 * 
 * {numRows: <number>, columns: [
 *  <column> 
 *  (, <column>)*
 * ]}
 * <column> ::= {title: <string>, content:[list of <content>]}
 * <content> := <string> | <button> | <truncatedContent> 
 * <button> ::= {button: {displayName: <string>, link: <string>}}
 * link should be string in the form of an HTML link e.g "/HomePage"
 * button links to the route given by link
 * <truncatedContent> ::= {truncatedContent: {truncatedVersion:<string>, fullVersion: <string>}}
 * 
 * - link should be string in the form of an HTML link e.g "/HomePage"
 * 
 * - button links to the route given by link
 * 
 * @param {Array} columnsToSort
 * 
 * - specifies which columns should be shown in table if columns is not specified all columns are shown
 * 
 * - columnsToSort is an array of {title: <string>, compare: <function> }
 * 
 * - title is the title of a column we want included in the table
 * - You can pass a custom comparator optionally with the compare parameter if you want custom sorting 
 * for the column with the specified title
 * 
 * - Default sorting order is alphabetical order of strings
 * 
 * 
 * 
 * @param {boolean} loading 
 * 
 * If loading is true table shows a loading spinner and ignores the data prop
 * 
*/

class Table extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data,
            columnsAscending: [true, true, true, true],
            sortColumn: null
        }
    }

    componentDidMount() {
        $('[data-toggle="tooltip"]').tooltip()
    }

    componentDidUpdate() {
        $('[data-toggle="tooltip"]').tooltip();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data) {
            this.setState(nextProps);
        }
    }

    handleSorting = (columnTitle) => {

        let dataCopy = JSON.parse(JSON.stringify(this.state.data))
        let arr = dataCopy.columns
        let compareFunction = this.getColumnCompareFunction(columnTitle);

        if (!compareFunction) { 
            compareFunction = this.defaultCompareFunction;
        }

            
        //bubble sort with the weird object 2d array 
        let columnIndex = this.getColumnIndex(columnTitle)
        let n = arr[columnIndex].content.length;

        for (let i = 0; i < n - 1; i++)
            for (let j = 0; j < n - i - 1; j++)
                if (this.state.columnsAscending[columnIndex] == true) {
                    if (compareFunction(arr[columnIndex].content[j], arr[columnIndex].content[j + 1]) > 0) {
                        // swap arr[j+1] and arr[j]
                        for (let k = 0; k < arr.length; k++) {
                            let temp = arr[k].content[j];
                            arr[k].content[j] = arr[k].content[j + 1];
                            arr[k].content[j + 1] = temp;
                        }
                    }
                } else {
                    if (compareFunction(arr[columnIndex].content[j], arr[columnIndex].content[j + 1]) < 0) {
                        // swap arr[j+1] and arr[j]
                        for (let k = 0; k < arr.length; k++) {
                            let temp = arr[k].content[j];
                            arr[k].content[j] = arr[k].content[j + 1];
                            arr[k].content[j + 1] = temp;
                        }
                    }
                }
        let columnsAscendingCopy = [...this.state.columnsAscending];
        columnsAscendingCopy[columnIndex] = !columnsAscendingCopy[columnIndex]
        this.setState({ data: dataCopy, columnsAscending: columnsAscendingCopy, sortColumn: columnIndex})
    }

    defaultCompareFunction(a,b) { 

        if (typeof a === "string") {
            a = a.toLowerCase();
        } else if (typeof a === "object" && Object.keys(a)[0] === "truncatedContent") {
            a = a.truncatedContent.fullVersion.toLowerCase();
        }

        if (typeof b === "string") {
            b = b.toLowerCase();
        } else if (typeof b === "object" && Object.keys(b)[0] === "truncatedContent") {
            b = b.truncatedContent.fullVersion.toLowerCase();
        }
    
        if (a > b) return 1;
        else if (a < b) return -1;
        else return 0;
    }

    render() {
        if (this.props.loading) {
            return (
                <div className="vertical-horizontal-center">
                    <div className="spinner-border text-primary" style={{ width: "6rem", height: "6rem" }}
                        role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            );
        } else if (this.props.data) {
            return (
                <table className="table table-striped" >
                    <thead>
                        {this.renderTableHeader()}
                    </thead>
                    <tbody>
                        {this.renderTableBody()}
                    </tbody>
                </table>
            );
        } else {
            return (
                <div> Error: Loading not set to true and data not available </div>
            );
        }
    }


    renderTableHeader() {
        return (
            <tr>
                {this.state.data.columns.map((column, i) => {
                    return (
                        <th key={i} className={this.isSortColumn(column.title)? "bg-secondary text-white" : ""}>
                            {column.title}
                            {this.addSortButtonToColumn(column.title) ?
                                <button className="btn-group-vertical float-right" onClick={() => this.handleSorting(column.title)}>
                                    <span>&#9650;</span>
                                </button> :
                                <span></span>}
                        </th>
                    );
                })}
            </tr>
        )
    }

    isSortColumn(columnTitle) {
        return this.getColumnIndex(columnTitle) === this.state.sortColumn;
    }

    renderTableBody() {
        return (
            [...Array(this.state.data.numRows).keys()].map((i) => {
                return <tr key={i} >{this.renderRow(i)}</tr>;
            })
        )
    }

    renderRow(i) {
        return (
            this.state.data.columns.map((current, j) => {
                return (
                    <td key={j} className="text-left">
                        {this.renderCell(current.content[i])}
                    </td>
                )
            })
        )
    }

    renderCell(cell, row) {
        let type = typeof cell;
        if(cell == null) {
            return "";
        }
        if (type === "string") {
            return cell
        } else if (type === "object") {
            switch (Object.keys(cell)[0]) {
                case "button":
                    let data = cell.button.data ? cell.button.data : null;
                    return (
                        <div className="d-flex justify-content-left">
                            <Link
                                className="btn btn-primary"
                                role="button"
                                to={{ pathname: cell.button.link, state: data }}>
                                {cell.button.displayName}
                            </Link>
                        </div>)
                case "truncatedContent":
                    return <span data-toggle="tooltip" data-placement="right" title={cell.truncatedContent.fullVersion}>
                        {cell.truncatedContent.truncatedVersion}
                    </span>
            }
        }
    }

    addSortButtonToColumn(columnTitle) {
        let columnsToSort = this.props.columnsToSort;
        return columnsToSort.map(({title}) => title).includes(columnTitle);
    }

    getColumnCompareFunction(columnTitle) {
        let columnsToSort = this.props.columnsToSort;
        for (let {title, compare} of columnsToSort) {
            if (title === columnTitle && compare) {
                return compare;
            }
        }
    }

    getColumnIndex(columnTitle) {
        let columns = this.state.data.columns;
        for (let i = 0; i < columns.length; i++) {
            let currentColumn = columns[i];
            if (currentColumn.title === columnTitle) {
                return i;
            }
        }
    }

}


export default Table;

