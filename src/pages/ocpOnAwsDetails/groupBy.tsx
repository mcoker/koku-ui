import { Dropdown, DropdownItem, DropdownToggle } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import { AwsQuery, getQuery } from 'api/awsQuery';
import { parseQuery } from 'api/awsQuery';
import { AwsReport, AwsReportType } from 'api/awsReports';
import React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { connect } from 'react-redux';
import { awsReportsActions, awsReportsSelectors } from 'store/awsReports';
import { createMapStateToProps, FetchStatus } from 'store/common';
import { GetComputedOcpOnAwsReportItemsParams } from 'utils/getComputedOcpOnAwsReportItems';
import { getIdKeyForGroupBy } from 'utils/getComputedOcpOnAwsReportItems';
import { styles } from './groupBy.styles';

interface GroupByOwnProps {
  onItemClicked(value: string);
  queryString?: string;
}

interface GroupByStateProps {
  report?: AwsReport;
  reportFetchStatus?: FetchStatus;
}

interface GroupByDispatchProps {
  fetchReport?: typeof awsReportsActions.fetchReport;
}

interface GroupByState {
  currentItem?: string;
  isGroupByOpen: boolean;
}

type GroupByProps = GroupByOwnProps &
  GroupByStateProps &
  GroupByDispatchProps &
  InjectedTranslateProps;

const groupByOptions: {
  label: string;
  value: GetComputedOcpOnAwsReportItemsParams['idKey'];
}[] = [
  { label: 'cluster', value: 'cluster' },
  { label: 'node', value: 'node' },
  { label: 'project', value: 'project' },
];

const reportType = AwsReportType.tag;

class GroupByBase extends React.Component<GroupByProps> {
  protected defaultState: GroupByState = {
    isGroupByOpen: false,
  };
  public state: GroupByState = { ...this.defaultState };

  constructor(stateProps, dispatchProps) {
    super(stateProps, dispatchProps);
    this.handleGroupByClick = this.handleGroupByClick.bind(this);
    this.handleGroupBySelect = this.handleGroupBySelect.bind(this);
    this.handleGroupByToggle = this.handleGroupByToggle.bind(this);
  }

  public componentDidMount() {
    const { fetchReport, queryString } = this.props;
    fetchReport(reportType, queryString);
    this.setState({
      currentItem: this.getGroupBy(),
    });
  }

  public componentDidUpdate(prevProps: GroupByProps) {
    const { fetchReport, queryString } = this.props;
    if (prevProps.queryString !== queryString) {
      fetchReport(reportType, queryString);
      this.setState({ currentItem: this.getGroupBy() });
    }
  }

  public handleGroupByClick = (event, value) => {
    const { onItemClicked } = this.props;
    if (onItemClicked) {
      this.setState({
        currentItem: value,
      });
      onItemClicked(value);
    }
  };

  private getDropDownItems = () => {
    const { t } = this.props;

    return groupByOptions.map(option => (
      <DropdownItem
        component="button"
        key={option.value}
        onClick={event => this.handleGroupByClick(event, option.value)}
      >
        {t(`group_by.values.${option.label}`)}
      </DropdownItem>
    ));
  };

  private getDropDownTags = () => {
    const { report, t } = this.props;

    if (report && report.data) {
      const data = [...new Set([...report.data])]; // prune duplicates
      return data.map(val => (
        <DropdownItem
          component="button"
          key={`tag:${val}`}
          onClick={event => this.handleGroupByClick(event, `tag:${val}`)}
        >
          {t('group_by.tag', { key: val })}
        </DropdownItem>
      ));
    } else {
      return [];
    }
  };

  private getGroupBy = () => {
    const queryFromRoute = parseQuery<AwsQuery>(location.search);
    let groupBy: string = getIdKeyForGroupBy(queryFromRoute.group_by);
    const groupByKeys =
      queryFromRoute && queryFromRoute.group_by
        ? Object.keys(queryFromRoute.group_by)
        : [];

    for (const key of groupByKeys) {
      const index = key.indexOf('tag:');
      if (index !== -1) {
        groupBy = key;
        break;
      }
    }
    return groupBy !== 'date' ? groupBy : 'project';
  };

  private handleGroupBySelect = event => {
    this.setState({
      isGroupByOpen: !this.state.isGroupByOpen,
    });
  };

  private handleGroupByToggle = isGroupByOpen => {
    this.setState({
      isGroupByOpen,
    });
  };

  public render() {
    const { t } = this.props;
    const { currentItem, isGroupByOpen } = this.state;

    const dropdownItems = [
      ...this.getDropDownItems(),
      ...this.getDropDownTags(),
    ];

    const index = currentItem ? currentItem.indexOf('tag:') : -1;
    const label =
      index !== -1
        ? t('group_by.tag', { key: currentItem.slice(4) })
        : t(`group_by.values.${currentItem}`);

    return (
      <div className={css(styles.groupBySelector)}>
        <label className={css(styles.groupBySelectorLabel)}>
          {t('group_by.cost')}:
        </label>
        <Dropdown
          onSelect={this.handleGroupBySelect}
          toggle={
            <DropdownToggle onToggle={this.handleGroupByToggle}>
              {label}
            </DropdownToggle>
          }
          isOpen={isGroupByOpen}
          dropdownItems={dropdownItems}
        />
      </div>
    );
  }
}

const mapStateToProps = createMapStateToProps<
  GroupByOwnProps,
  GroupByStateProps
>(state => {
  const queryString = getQuery({
    filter: {
      resolution: 'monthly',
      time_scope_units: 'month',
      time_scope_value: -1,
    },
    key_only: true,
  });
  const report = awsReportsSelectors.selectReport(
    state,
    reportType,
    queryString
  );
  const reportFetchStatus = awsReportsSelectors.selectReportFetchStatus(
    state,
    reportType,
    queryString
  );
  return {
    queryString,
    report,
    reportFetchStatus,
  };
});

const mapDispatchToProps: GroupByDispatchProps = {
  fetchReport: awsReportsActions.fetchReport,
};

const GroupBy = translate()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(GroupByBase)
);

export { GroupBy, GroupByProps };
