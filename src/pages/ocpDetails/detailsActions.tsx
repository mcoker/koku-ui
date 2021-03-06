import { Dropdown, DropdownItem, KebabToggle } from '@patternfly/react-core';
import { OcpQuery } from 'api/ocpQuery';
import React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { ComputedOcpReportItem } from 'utils/getComputedOcpReportItems';
import { DetailsTagModal } from './detailsTagModal';
import { DetailsWidgetModal } from './detailsWidgetModal';
import { ExportModal } from './exportModal';
import { HistoricalModal } from './historicalModal';
import PriceListModal from './priceListModal';

interface DetailsActionsOwnProps {
  groupBy: string;
  item: ComputedOcpReportItem;
  query: OcpQuery;
}

interface DetailsActionsState {
  isDropdownOpen: boolean;
  isExportModalOpen: boolean;
  isHistoricalModalOpen: boolean;
  isPriceListModalOpen: boolean;
  isTagModalOpen: boolean;
  isWidgetModalOpen: boolean;
}

type DetailsActionsProps = DetailsActionsOwnProps & InjectedTranslateProps;

class DetailsActionsBase extends React.Component<DetailsActionsProps> {
  protected defaultState: DetailsActionsState = {
    isDropdownOpen: false,
    isExportModalOpen: false,
    isHistoricalModalOpen: false,
    isPriceListModalOpen: false,
    isTagModalOpen: false,
    isWidgetModalOpen: false,
  };
  public state: DetailsActionsState = { ...this.defaultState };

  constructor(props: DetailsActionsProps) {
    super(props);
    this.handleExportModalClose = this.handleExportModalClose.bind(this);
    this.handleExportModalOpen = this.handleExportModalOpen.bind(this);
    this.handleHistoricalModalClose = this.handleHistoricalModalClose.bind(
      this
    );
    this.handleHistoricalModalOpen = this.handleHistoricalModalOpen.bind(this);
    this.handlePriceListModalClose = this.handlePriceListModalClose.bind(this);
    this.handlePriceListModalOpen = this.handlePriceListModalOpen.bind(this);
    this.handleTagModalClose = this.handleTagModalClose.bind(this);
    this.handleTagModalOpen = this.handleTagModalOpen.bind(this);
    this.handleWidgetModalClose = this.handleWidgetModalClose.bind(this);
    this.handleWidgetModalOpen = this.handleWidgetModalOpen.bind(this);
    this.handleOnToggle = this.handleOnToggle.bind(this);
    this.handleOnSelect = this.handleOnSelect.bind(this);
  }

  private getExportModal = () => {
    const { groupBy, item, query } = this.props;
    const { isExportModalOpen } = this.state;

    return (
      <ExportModal
        groupBy={groupBy}
        isOpen={isExportModalOpen}
        items={[item]}
        onClose={this.handleExportModalClose}
        query={query}
      />
    );
  };

  private getHistoricalModal = () => {
    const { groupBy, item } = this.props;
    const { isHistoricalModalOpen } = this.state;

    return (
      <HistoricalModal
        groupBy={groupBy}
        isOpen={isHistoricalModalOpen}
        item={item}
        onClose={this.handleHistoricalModalClose}
      />
    );
  };

  private getPriceListModal = () => {
    const {
      item: { cluster },
    } = this.props;
    return (
      <PriceListModal
        name={cluster}
        isOpen={this.state.isPriceListModalOpen}
        close={this.handlePriceListModalClose}
      />
    );
  };

  private getTagModal = () => {
    const { groupBy, item } = this.props;
    const { isTagModalOpen } = this.state;

    return (
      <DetailsTagModal
        groupBy={groupBy}
        isOpen={isTagModalOpen}
        item={item}
        onClose={this.handleTagModalClose}
        project={item.label || item.id}
      />
    );
  };

  private getWidgetModal = () => {
    const { groupBy, item } = this.props;
    const { isWidgetModalOpen } = this.state;

    return (
      <DetailsWidgetModal
        groupBy="project"
        isOpen={isWidgetModalOpen}
        item={item}
        onClose={this.handleWidgetModalClose}
        parentGroupBy={groupBy}
      />
    );
  };

  public handleExportModalClose = (isOpen: boolean) => {
    this.setState({ isExportModalOpen: isOpen });
  };

  public handleExportModalOpen = () => {
    this.setState({ isExportModalOpen: true });
  };

  public handleHistoricalModalClose = (isOpen: boolean) => {
    this.setState({ isHistoricalModalOpen: isOpen });
  };

  public handleHistoricalModalOpen = () => {
    this.setState({ isHistoricalModalOpen: true });
  };

  public handlePriceListModalClose = (isOpen: boolean) => {
    this.setState({ isPriceListModalOpen: isOpen });
  };

  public handlePriceListModalOpen = () => {
    this.setState({ isPriceListModalOpen: true });
  };

  public handleTagModalClose = (isOpen: boolean) => {
    this.setState({ isTagModalOpen: isOpen });
  };

  public handleTagModalOpen = () => {
    this.setState({ isTagModalOpen: true });
  };

  public handleWidgetModalClose = (isOpen: boolean) => {
    this.setState({ isWidgetModalOpen: isOpen });
  };

  public handleWidgetModalOpen = () => {
    this.setState({ isWidgetModalOpen: true });
  };

  public handleOnSelect = () => {
    const { isDropdownOpen } = this.state;
    this.setState({
      isDropdownOpen: !isDropdownOpen,
    });
  };

  public handleOnToggle = (isDropdownOpen: boolean) => {
    this.setState({ isDropdownOpen });
  };

  public render() {
    const { groupBy, t } = this.props;

    return (
      <>
        <Dropdown
          onSelect={this.handleOnSelect}
          toggle={<KebabToggle onToggle={this.handleOnToggle} />}
          isOpen={this.state.isDropdownOpen}
          isPlain
          position="right"
          dropdownItems={[
            <DropdownItem
              component="button"
              key="price-list-action"
              isDisabled={groupBy !== 'cluster'}
              onClick={this.handlePriceListModalOpen}
            >
              {t('ocp_details.actions.price_list')}
            </DropdownItem>,
            <DropdownItem
              component="button"
              key="historical-data-action"
              onClick={this.handleHistoricalModalOpen}
            >
              {t('ocp_details.actions.historical_data')}
            </DropdownItem>,
            <DropdownItem
              component="button"
              key="widget-action"
              isDisabled={groupBy !== 'cluster'}
              onClick={this.handleWidgetModalOpen}
            >
              {t('ocp_details.actions.projects')}
            </DropdownItem>,
            <DropdownItem
              component="button"
              key="tag-action"
              isDisabled={groupBy !== 'project'}
              onClick={this.handleTagModalOpen}
            >
              {t('ocp_details.actions.tags')}
            </DropdownItem>,
            <DropdownItem
              component="button"
              key="export-action"
              onClick={this.handleExportModalOpen}
            >
              {t('ocp_details.actions.export')}
            </DropdownItem>,
          ]}
        />
        {this.getExportModal()}
        {this.getHistoricalModal()}
        {this.getTagModal()}
        {this.getWidgetModal()}
        {this.getPriceListModal()}
      </>
    );
  }
}

const DetailsActions = translate()(DetailsActionsBase);

export { DetailsActions };
