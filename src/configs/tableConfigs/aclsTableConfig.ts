import { ParseKeys } from "i18next";

export type TableConfig = {
	columns: TableColumn[],
	caption: string,
	resource: string,
	category: string,
	multiSelect: boolean,
}

export type TableColumn = {
	name: string,
	label: ParseKeys,
	template?: string,
	sortable?: boolean,
	translate?: boolean,
	deactivated?: boolean,
}

/**
 * Config that contains the columns and further information regarding acls. These are the information that never or hardly changes.
 * That's why it is hard coded here and not fetched from server.
 * Information configured in this file:
 * - columns: names, labels, sortable, (template)
 * - caption for showing in table view
 * - resource type (here: acls)
 * - category type (here: users)
 * - is multi select possible?
 */
export const aclsTableConfig: TableConfig = {
	columns: [
		{
			name: "name",
			label: "USERS.ACLS.TABLE.NAME",
			sortable: true,
		},
		{
			template: "AclsActionsCell",
			name: "actions",
			label: "USERS.ACLS.TABLE.ACTION",
		},
	],
	caption: "USERS.ACLS.TABLE.CAPTION",
	resource: "acls",
	category: "users",
	multiSelect: false,
};
