import { css } from '@patternfly/react-styles';
import { getQuery, OcpQuery } from 'api/ocpQuery';
import { OcpReport } from 'api/ocpReports';
import { Col, ListView, Row } from 'patternfly-react';
import React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { connect } from 'react-redux';
import { FetchStatus } from 'store/common';
import { ocpReportsActions } from 'store/ocpReports';
import { formatCurrency } from 'utils/formatValue';
import {
  ComputedOcpReportItem,
  GetComputedOcpReportItemsParams,
  getIdKeyForGroupBy,
} from 'utils/getComputedOcpReportItems';
import { DetailsChart } from './detailsChart';
import { styles } from './ocpDetails.styles';

interface DetailsItemOwnProps {
  charge: number;
  parentQuery: OcpQuery;
  parentGroupBy: any;
  item: ComputedOcpReportItem;
  onCheckboxChange(checked: boolean, item: ComputedOcpReportItem);
  selected: boolean;
}

interface State {
  expanded: boolean;
  currentGroupBy?: string;
  queryString?: string;
}

interface DetailsItemStateProps {
  report?: OcpReport;
  reportFetchStatus?: FetchStatus;
}

interface DetailsItemDispatchProps {
  fetchReport?: typeof ocpReportsActions.fetchReport;
}

type DetailsItemProps = DetailsItemOwnProps &
  DetailsItemStateProps &
  DetailsItemDispatchProps &
  InjectedTranslateProps;

const groupByOptions: {
  label: string;
  value: GetComputedOcpReportItemsParams['idKey'];
}[] = [
  { label: 'cluster', value: 'cluster' },
  { label: 'node', value: 'node' },
  { label: 'project', value: 'project' },
];

class DetailsItemBase extends React.Component<DetailsItemProps> {
  public state: State = {
    expanded: false,
  };

  private getQueryString(groupBy) {
    const { parentQuery, item } = this.props;
    const groupById = getIdKeyForGroupBy(parentQuery.group_by);
    const newQuery: OcpQuery = {
      filter: {
        time_scope_units: 'month',
        time_scope_value: -1,
        resolution: 'monthly',
        limit: 5,
      },
      group_by: { [groupById]: item.id, [groupBy]: '*' },
    };
    return getQuery(newQuery);
  }

  private getDefaultGroupBy() {
    const { parentGroupBy } = this.props;
    let groupBy = '';
    switch (parentGroupBy) {
      case 'cluster':
        groupBy = 'cluster';
        break;
      case 'node':
        groupBy = 'node';
        break;
      case 'project':
        groupBy = 'project';
        break;
    }
    return groupBy;
  }

  public componentDidMount() {
    const defaultGroupBy = this.getDefaultGroupBy();
    const queryString = this.getQueryString(defaultGroupBy);
    this.setState({ currentGroupBy: defaultGroupBy, queryString });
  }

  public componentDidUpdate(prevProps: DetailsItemProps) {
    if (this.props.parentGroupBy !== prevProps.parentGroupBy) {
      const defaultGroupBy = this.getDefaultGroupBy();
      this.setState({ currentGroupBy: defaultGroupBy });
    }
  }

  public handleExpand = () => {
    const { currentGroupBy } = this.state;
    const queryString = this.getQueryString(currentGroupBy);
    this.setState({ expanded: true, queryString });
  };

  public handleExpandClose = () => {
    this.setState({ expanded: false });
  };

  public handleCheckboxChange = event => {
    const { item, onCheckboxChange } = this.props;
    onCheckboxChange(event.currentTarget.checked, item);
  };

  public handleSelectChange = (event: React.FormEvent<HTMLSelectElement>) => {
    const groupByKey: keyof OcpQuery['group_by'] = event.currentTarget
      .value as any;
    const queryString = this.getQueryString(groupByKey);
    this.setState({ currentGroupBy: groupByKey, queryString });
  };

  public render() {
    const { charge, t, item, parentGroupBy, selected } = this.props;
    const { currentGroupBy, queryString } = this.state;

    const today = new Date();
    const date = today.getDate();
    const month = (today.getMonth() - 1) % 12;

    const value = formatCurrency(Math.abs(item.deltaValue));
    const percentage = Math.abs(item.deltaPercent).toFixed(2);

    let iconOverride = 'iconOverride';
    if (item.deltaValue < 0) {
      iconOverride += ' decrease';
    }
    if (item.deltaValue > 0) {
      iconOverride += ' increase';
    }

    return (
      <ListView.Item
        key={item.label}
        heading={item.label}
        checkboxInput={
          <input
            type="checkbox"
            checked={selected}
            onChange={this.handleCheckboxChange}
          />
        }
        additionalInfo={[
          <ListView.InfoItem key="1" stacked>
            <strong className={iconOverride}>
              {t('percent', { value: percentage })}
              {Boolean(item.deltaValue > 0) && (
                <span className={css('fa fa-sort-asc', styles.infoItemArrow)} />
              )}
              {Boolean(item.deltaValue < 0) && (
                <span
                  className={css('fa fa-sort-desc', styles.infoItemArrow)}
                />
              )}
            </strong>
            <span>
              {(Boolean(item.deltaValue > 0) &&
                ((Boolean(date < 31) &&
                  t('ocp_details.increase_since_date', {
                    date,
                    month,
                    value,
                  })) ||
                  t('ocp_details.increase_since_last_month', {
                    date,
                    month,
                    value,
                  }))) ||
                (Boolean(item.deltaValue < 0) &&
                  ((Boolean(date < 31) &&
                    t('ocp_details.decrease_since_date', {
                      date,
                      month,
                      value,
                    })) ||
                    t('ocp_details.decrease_since_last_month', {
                      date,
                      month,
                      value,
                    }))) ||
                t('ocp_details.no_change_since_date', { date, month })}
            </span>
          </ListView.InfoItem>,
        ]}
        actions={[
          <ListView.InfoItem key="1" stacked>
            <strong>{formatCurrency(item.charge)}</strong>
            <span>
              {((item.charge / charge) * 100).toFixed(2)}
              {t('percent_of_charge')}
            </span>
          </ListView.InfoItem>,
        ]}
        onExpand={this.handleExpand}
        onExpandClose={this.handleExpandClose}
      >
        <Row>
          <Col>
            <div>
              <div className={css(styles.innerGroupBySelector)}>
                <label className={css(styles.innerGroupBySelectorLabel)}>
                  {t('group_by.label')}:
                </label>
                <select
                  id={item.label ? item.label.toString() : ''}
                  onChange={this.handleSelectChange}
                >
                  {groupByOptions.map(option => {
                    if (option.value !== parentGroupBy) {
                      return (
                        <option key={option.value} value={option.value}>
                          {t(`group_by.values.${option.label}`)}
                        </option>
                      );
                    }
                  })}
                </select>
              </div>
              {Boolean(currentGroupBy) &&
                Boolean(queryString) && (
                  <DetailsChart
                    queryString={queryString}
                    currentGroupBy={currentGroupBy}
                  />
                )}
            </div>
          </Col>
        </Row>
      </ListView.Item>
    );
  }
}

const DetailsItem = translate()(connect()(DetailsItemBase));

export { DetailsItem, DetailsItemBase, DetailsItemProps };
