import {
  Button,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import { Provider } from 'api/providers';
import { AxiosError } from 'axios';
import { ErrorState } from 'components/state/errorState/errorState';
import { LoadingState } from 'components/state/loadingState/loadingState';
import { NoProvidersState } from 'components/state/noProvidersState/noProvidersState';
import React from 'react';
import { InjectedTranslateProps } from 'react-i18next';
import { FetchStatus } from 'store/common';
import { onboardingActions } from 'store/onboarding';
import { deleteDialogActions } from 'store/sourceDeleteDialog';
import { sourcesActions } from 'store/sourceSettings';
import DetailsTableItem from './detailsTableItem';
import Header from './header';
import { NoMatchFoundState } from './noMatchFoundState';
import rowCell from './rowCell';
import { styles } from './sourceSettings.styles';
import SourceTable from './table';
import FilterToolbar from './toolbar';

interface Props extends InjectedTranslateProps {
  sources: Provider[];
  error: AxiosError;
  status: FetchStatus;
  fetch: typeof sourcesActions.fetchSources;
  remove: typeof sourcesActions.removeSource;
  showDeleteDialog: typeof deleteDialogActions.openModal;
  onAdd: typeof onboardingActions.openModal;
}

interface State {
  selected: string[];
  expanded: string[];
  query: string;
}

class SourceSettings extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = { selected: [], expanded: [], query: '' };
    this.onSelect = this.onSelect.bind(this);
    this.onCollapse = this.onCollapse.bind(this);
    this.onSearch = this.onSearch.bind(this);
  }

  public componentDidMount() {
    this.props.fetch(this.state.query);
  }

  public onSearch(query) {
    this.setState({ query });
    this.props.fetch(query);
  }

  public onSelect(event, isSelected, rowId) {
    if (rowId === -1) {
      this.setState(prevState => ({
        selected: isSelected
          ? this.props.sources.map(src => `${src.name}-${src.type}`)
          : [],
      }));
      return;
    }

    const source = this.props.sources[rowId / 2];
    if (isSelected) {
      this.setState(prevState => ({
        selected: [...prevState.selected, `${source.name}-${source.type}`],
      }));
    }

    if (!isSelected) {
      this.setState(prevState => {
        const ix = prevState.selected.indexOf(`${source.name}-${source.type}`);
        return {
          selected: [
            ...prevState.selected.slice(0, ix),
            ...prevState.selected.slice(ix + 1),
          ],
        };
      });
    }
  }

  public onCollapse(event, rowKey, isOpen) {
    const src = this.props.sources[rowKey / 2];
    if (isOpen) {
      this.setState(prevState => ({
        expanded: [...prevState.expanded, `${src.name}-${src.type}`],
      }));
      return;
    }

    this.setState(prevState => {
      const ix = prevState.expanded.indexOf(`${src.name}-${src.type}`);
      return {
        expanded: [
          ...prevState.expanded.slice(0, ix),
          ...prevState.expanded.slice(ix + 1),
        ],
      };
    });
  }

  public render() {
    const {
      sources,
      status,
      error,
      t,
      onAdd,
      remove,
      showDeleteDialog,
    } = this.props;
    const columns = [
      t('source_details.column.name'),
      t('source_details.column.type'),
      t('source_details.column.last_contacted'),
      '',
    ];
    const rows = sources
      .map((src, ix) => [
        {
          cells: rowCell(t, src, () => {
            showDeleteDialog({
              name: src.name,
              type: src.type,
              onDelete: () => {
                remove(src.uuid);
              },
            });
          }),
          isOpen: this.state.expanded.indexOf(`${src.name}-${src.type}`) >= 0,
          // TODO: Uncomment when bulk delete is available
          // selected: this.state.selected.indexOf(`${src.name}-${src.type}`) >= 0,
        },
        {
          parent: 2 * ix,
          cells: [
            <DetailsTableItem key={`i-${src.name}-${src.type}`} source={src} />,
          ],
          // TODO: Uncomment when bulk delete is available
          // selected: true,
        },
      ])
      .reduce((acc, curr) => {
        return [...acc, ...curr];
      }, []);

    return (
      <div className={css(styles.sourceSettings)}>
        <Header t={t} />
        <div className={css(styles.content)}>
          {status === FetchStatus.complete && (
            <div className={css(styles.toolbarContainer)}>
              <Toolbar>
                <FilterToolbar
                  t={t}
                  onSearch={this.onSearch}
                  options={{
                    name: t('source_details.column.name'),
                    type: t('source_details.column.type'),
                  }}
                />
                <ToolbarGroup>
                  <ToolbarItem>
                    <Button
                      onClick={() => {
                        onAdd();
                      }}
                      variant="tertiary"
                    >
                      Add source
                    </Button>
                  </ToolbarItem>
                </ToolbarGroup>
              </Toolbar>
            </div>
          )}
          {status !== FetchStatus.complete && <LoadingState />}
          {status === FetchStatus.complete && Boolean(error) && (
            <ErrorState error={error} />
          )}
          {status === FetchStatus.complete && rows.length > 0 && (
            <SourceTable
              // TODO: Uncomment when bulk delete is available
              // onSelect={this.onSelect}
              onCollapse={this.onCollapse}
              columns={columns}
              rows={rows}
            />
          )}
          {status === FetchStatus.complete &&
            this.state.query === '' &&
            rows.length === 0 && <NoProvidersState />}
          {status === FetchStatus.complete &&
            this.state.query !== '' &&
            rows.length === 0 && <NoMatchFoundState />}
        </div>
      </div>
    );
  }
}

export default SourceSettings;
