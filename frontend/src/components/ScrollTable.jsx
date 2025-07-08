import { Table } from 'react-daisyui';

function ScrollTable({ args, noCell, renderRow, renderHeaders, renderFooter }) {
    const renderRows = new Array(10).fill('').map(() =>
        <Table.Row noCell={noCell}>{renderRow(!noCell)}</Table.Row>);

    return (
        <div className="overflow-x-auto max-w-lg max-h-80">
            <Table {...args}>
                <Table.Head noCell={noCell}>{renderHeaders(!noCell)}</Table.Head>
                <Table.Body>{renderRows}</Table.Body>
                <Table.Footer noCell={noCell}>{renderFooter(!noCell)}</Table.Footer>
            </Table>
        </div>
    )
}

export default ScrollTable;