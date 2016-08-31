import React from 'react'
import { Table, Input } from 'react-bootstrap'
import { debounce } from 'lodash'
import moment from 'moment'

const parseLine = line => {
  const firstSpace = line.indexOf(' ')
  const secondSpace = line.indexOf(' ', firstSpace + 1)
  const raw = line
  const pod = line.slice(0, firstSpace).trim()
  const text = line.slice(secondSpace, line.length)

  return { pod, text, raw }
}

// date, app, process
const parseLogs = (logs) => (
  logs.substring(2,logs.length-1).split('\\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .map(parseLine)
    )

const getColumns = (logs) => (
  // Merge all rows together, then extract keys
  Object.keys(logs.reduce((cols, row) => ({ ...cols, ...row }), {}))
)


export default class LogsTable extends React.Component {
  constructor(props) {
    super(props)
    this.onFilter = this.onFilter.bind(this)

    const rawLogs = props.logs

    this.state = {
      logs: parseLogs(rawLogs),
      filter: {
        pod: '',
        text: '',
      },
      pendingFilter: {
        pod: '',
        text: '',
      },
      prettyDate: false,
    }
  }

  onFilter(colName) {
    const debouncedFn = debounce((value) => {
      this.setState({
        filter: {
          ...this.state.filter,
          [colName]: value,
        },
      })
    }, 300)
    return (e) => {
      // https://github.com/facebook/react/issues/2850
      this.setState({
        pendingFilter: {
          ...this.state.pendingFilter,
          [colName]: e.target.value,
        },
      })
      debouncedFn(e.target.value)
    }
  }

  render() {
    // TODO: move this to reducer?
    // const columns = getColumns(logs)
    const { logs, filter } = this.state

    let filteredLogs = logs

    if (filter.pod) {
      filteredLogs = filteredLogs.filter((row) => (
        row.pod && row.pod.indexOf(filter.pod) >= 0
      ))
    }

    if (filter.text) {
      filteredLogs = filteredLogs.filter((row) => (
        row.text && row.text.indexOf(filter.text) >= 0
      ))
    }

    const trs = filteredLogs.map((row, idx) => {
      return (
        <tr key={idx}>
          <td className="col-pod">{row.pod}</td>
          <td className="col-text">{row.text}</td>
        </tr>
      )
    })

    return (
      <div className="logs-table">
        <div className="form">
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Filter by pod"
              value={this.state.pendingFilter.pod}
              onChange={this.onFilter('pod')}
            />
          </div>
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Search logs"
              value={this.state.pendingFilter.text}
              onChange={this.onFilter('text')}
            />
          </div>
        </div>
        <Table striped condensed hover>
          <thead>
            <tr>
              <th>Pod</th>
              <th className="col-pod">Text</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {trs}
          </tbody>
        </Table>
      </div>
    )
  }
}


/*
export default ({ logs }) => {
  // TODO: move parsing to reducer?

  const parsedLogs = parseLogs(logs)

  const tableOpts = {
    rowsHeight: 50,
    rowsCount: parseLogs.length,
    width: 5000,
    height: 5000,
    headerHeight: 50,
  }

  const columns = [
    <Column
      header={<Cell>Date</Cell>}
      cell={<Cell>Column 1 static content</Cell>}
      width={2000}
    />
  ]

  return (
   <Table
      rowsCount={100}
      rowHeight={50}
      width={1000}
      headerHeight={10}
      height={500}>
      <Column
        cell={<Cell>Basic content</Cell>}
        width={200}
      />
    </Table>
  )
}
*/
