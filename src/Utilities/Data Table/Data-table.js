import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";

export default function DataTable(props) {
    return (
        <div style={props.style}>
            <DataGrid
                rows={props.rows}
                columns={props.columns}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                        autoPageSize: true,
                    },
                }}
                pageSizeOptions={[5, 10]}
                loading={props.loading}
                checkboxSelection={false}
                onRowDoubleClick={props.onRowDoubleClick}
                hideFooterSelectedRowCount={true}
            />
        </div>
    );
}
