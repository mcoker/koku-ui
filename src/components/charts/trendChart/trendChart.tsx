import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartLegend,
  ChartTooltip,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import { css } from '@patternfly/react-styles';
import { ChartLabelTooltip } from 'components/charts/chartLabelTooltip';
import {
  ChartDatum,
  getDateRange,
  getDateRangeString,
  getMaxValue,
  getMonthRangeString,
  getTooltipContent,
  getTooltipLabel,
} from 'components/charts/commonChart/chartUtils';
import getDate from 'date-fns/get_date';
import React from 'react';
import { FormatOptions, ValueFormatter } from 'utils/formatValue';
import { DomainTuple, VictoryStyleInterface } from 'victory';
import { chartStyles, styles } from './trendChart.styles';

interface TrendChartProps {
  currentData: any;
  height?: number;
  previousData?: any;
  formatDatumValue: ValueFormatter;
  formatDatumOptions?: FormatOptions;
  title?: string;
}

interface TrendChartDatum {
  data?: any;
  name?: string;
  show?: boolean;
  style?: VictoryStyleInterface;
}

interface TrendNameDatum {
  name?: string;
}

interface TrendLegendDatum {
  colorScale?: string[];
  data?: TrendNameDatum[];
  onClick?: (props) => void;
  title?: string;
}

interface Data {
  charts?: TrendChartDatum[];
  legend?: TrendLegendDatum;
}

interface State {
  datum?: {
    cost?: Data;
  };
  width: number;
}

class TrendChart extends React.Component<TrendChartProps, State> {
  private containerRef = React.createRef<HTMLDivElement>();
  public state: State = {
    width: 0,
  };

  public componentDidMount() {
    setTimeout(() => {
      if (this.containerRef.current) {
        this.setState({ width: this.containerRef.current.clientWidth });
      }
      window.addEventListener('resize', this.handleResize);
    });
    this.initDatum();
  }

  public componentDidUpdate(prevProps: TrendChartProps) {
    if (
      prevProps.currentData !== this.props.currentData ||
      prevProps.previousData !== this.props.previousData
    ) {
      this.initDatum();
    }
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  private initDatum = () => {
    const { currentData, previousData, title } = this.props;

    // Show all legends, regardless of length -- https://github.com/project-koku/koku-ui/issues/248
    const legendData = [];
    if (previousData) {
      const [start] = getMonthRangeString(
        previousData,
        'chart.month_legend_label',
        1
      );
      legendData.push({
        name: start,
        symbol: {
          type: 'minus',
        },
        tooltip: getDateRangeString(previousData, true, true, 1),
      });
    }
    if (currentData) {
      const [start] = getMonthRangeString(
        currentData,
        'chart.month_legend_label'
      );
      legendData.push({
        name: start,
        symbol: {
          type: 'minus',
        },
        tooltip: getDateRangeString(currentData, true, false),
      });
    }
    const cost = {
      charts: [
        {
          data: previousData,
          name: 'previous',
          show: true,
          style: chartStyles.previousMonth,
        },
        {
          data: currentData,
          name: 'current',
          show: true,
          style: chartStyles.currentMonth,
        },
      ],
      legend: {
        colorScale: chartStyles.colorScale,
        data: legendData,
        onClick: this.handleCostLegendClick,
        title,
      },
    };

    this.setState({
      datum: {
        cost,
      },
    });
  };

  private handleCostLegendClick = props => {
    const { datum } = this.state;
    const newDatum = { ...datum };

    if (props.index >= 0 && newDatum.cost.charts.length) {
      newDatum.cost.charts[props.index].show = !newDatum.cost.charts[
        props.index
      ].show;
      this.setState({ datum: newDatum });
    }
  };

  private handleResize = () => {
    if (this.containerRef.current) {
      this.setState({ width: this.containerRef.current.clientWidth });
    }
  };

  private getChart = (datum: TrendChartDatum, index: number) => {
    if (datum.data && datum.data.length && datum.show) {
      return (
        <ChartArea
          data={datum.data}
          name={datum.name}
          key={`trend-chart-${index}`}
          style={datum.style}
        />
      );
    } else {
      return null;
    }
  };

  private getDomain() {
    const { currentData, previousData } = this.props;
    const domain: { x: DomainTuple; y?: DomainTuple } = { x: [1, 31] };

    const maxCurrent = currentData ? getMaxValue(currentData) : 0;
    const maxPrevious = previousData ? getMaxValue(previousData) : 0;
    const maxValue = Math.max(maxCurrent, maxPrevious);
    const max = maxValue > 0 ? Math.ceil(maxValue + maxValue * 0.1) : 0;

    if (max > 0) {
      domain.y = [0, max];
    }
    return domain;
  }

  private getEndDate() {
    const { currentData, previousData } = this.props;
    const previousDate = previousData
      ? getDate(getDateRange(previousData, true, true)[1])
      : 0;
    const currentDate = currentData
      ? getDate(getDateRange(currentData, true, true)[1])
      : 0;

    return currentDate > 0 || previousDate > 0
      ? Math.max(currentDate, previousDate)
      : 31;
  }

  private getLegend = (datum: TrendLegendDatum, width: number) => {
    if (datum && datum.data && datum.data.length) {
      return (
        <ChartLegend
          colorScale={datum.colorScale}
          data={datum.data}
          events={[
            {
              target: 'data',
              eventHandlers: {
                onClick: () => {
                  return [
                    {
                      target: 'data',
                      mutation: props => {
                        datum.onClick(props);
                        return null;
                      },
                    },
                  ];
                },
              },
            },
          ]}
          gutter={20}
          height={25}
          labelComponent={<ChartLabelTooltip content={this.getLegendTooltip} />}
          orientation={width > 150 ? 'horizontal' : 'vertical'}
          style={chartStyles.legend}
          width={width}
        />
      );
    } else {
      return null;
    }
  };

  private getLegendTooltip = (datum: ChartDatum) => {
    return datum.tooltip ? datum.tooltip : '';
  };

  private getTooltipLabel = (datum: ChartDatum) => {
    const { formatDatumValue, formatDatumOptions } = this.props;
    return getTooltipLabel(
      datum,
      getTooltipContent(formatDatumValue),
      formatDatumOptions,
      'date'
    );
  };

  private isLegendVisible() {
    const { datum } = this.state;

    let result = false;
    if (datum && datum.cost.legend && datum.cost.legend.data) {
      datum.cost.legend.data.forEach(item => {
        if (item.name && item.name.trim() !== '') {
          result = true;
          return;
        }
      });
    }
    return result;
  }

  public render() {
    const { height } = this.props;
    const { datum, width } = this.state;

    const container = (
      <ChartVoronoiContainer
        labelComponent={
          <ChartTooltip
            flyoutStyle={chartStyles.tooltip.flyoutStyle}
            pointerWidth={20}
            style={chartStyles.tooltip.style}
          />
        }
        labels={this.getTooltipLabel}
        voronoiDimension="x"
      />
    );
    const legendWidth =
      chartStyles.legend.minWidth > width / 2
        ? chartStyles.legend.minWidth
        : width / 2;
    const domain = this.getDomain();

    const endDate = this.getEndDate();
    const midDate = Math.floor(endDate / 2);

    return (
      <div className={css(styles.chartContainer)} ref={this.containerRef}>
        <Chart
          containerComponent={container}
          domain={domain}
          height={height}
          width={width}
        >
          {Boolean(datum && datum.cost) &&
            datum.cost.charts.map((chart, index) => {
              return this.getChart(chart, index);
            })}
          <ChartAxis
            style={chartStyles.xAxis}
            tickValues={[1, midDate, endDate]}
          />
          <ChartAxis dependentAxis style={chartStyles.yAxis} />
        </Chart>
        {Boolean(this.isLegendVisible()) && (
          <div className={css(styles.legend)}>
            {Boolean(datum.cost.legend.title) && (
              <div className={css(styles.legendTitle)}>
                {datum.cost.legend.title}
              </div>
            )}
            {this.getLegend(datum.cost.legend, legendWidth)}
          </div>
        )}
      </div>
    );
  }
}

export { TrendChart, TrendChartProps };
