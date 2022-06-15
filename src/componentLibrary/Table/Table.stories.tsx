import { Story, Meta } from '@storybook/react';

import { Table, TableProps } from './';

const Template: Story<TableProps> = (args) => <Table {...args} />;

const Default = Template.bind({});
Default.args = {
    columnLabels: ['test1', 'test2'],
    rows: [[1,2], [11, 12], ["a", 35]]
};

export { Default };

export default {
  title: 'Components/Table',
  component: Table
} as Meta;
