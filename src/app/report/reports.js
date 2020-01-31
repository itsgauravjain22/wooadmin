import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as SecureStore from 'expo-secure-store';
import { VictoryChart, VictoryBar, VictoryPie, VictoryAxis, VictoryLabel } from 'victory-native';
import moment from 'moment';

export default class Reports extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Reports',
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            base_url: null,
            c_key: null,
            c_secret: null,
            refreshing: false,
            showFromDateSelector: false,
            fromDate: moment().subtract(7, 'days').toDate(),
            showToDateSelector: false,
            toDate: moment().toDate(),
            isSalesTotalsReportDataReady: false,
            salesTotalsReportData: [],
            isOrdersTotalsReportDataReady: false,
            ordersTotalsReportData: [],
            isCustomersTotalsReportDataReady: false,
            customersTotalsReportData: [],
            isReviewsTotalsReportDataReady: false,
            reviewsTotalsReportData: [],
            isproductsTotalsReportDataReady: false,
            productsTotalsReportData: [],
            isCouponsTotalsReportDataReady: false,
            couponsTotalsReportData: []
        };
    }

    async componentDidMount() {
        this._isMounted = true;
        this._isMounted && await this.getCredentials()
        this._isMounted && this.fetchAllReports()
    }

    getCredentials = async () => {
        const credentials = await SecureStore.getItemAsync('credentials');
        const credentialsJson = JSON.parse(credentials)
        this.setState({
            base_url: credentialsJson.base_url,
            c_key: credentialsJson.c_key,
            c_secret: credentialsJson.c_secret,
        })
    }

    render() {
        return (
            <ScrollView
                style={{ flex: 1 }}
                horizontal={false}
                refreshControl={
                    <RefreshControl
                        refreshing={false}
                        onRefresh={this.fetchAllReports}
                    />
                }
            >
                {this.displayDateSelector()}
                {this.displaySalesTotalsReportSection()}
                {this.displayOrdersTotalsReportSection()}
                {this.displayCustomersTotalsReportSection()}
                {this.displayReviewsTotalsReportSection()}
                {this.displayProductsTotalsReportSection()}
                {this.displayCouponsTotalsReportSection()}
            </ScrollView>
        );
    }

    //Fetch Function Below

    fetchAllReports = () => {
        this.fetchDateBasedReports()
        this.fetNonDateBasedReports()
    }

    fetchDateBasedReports = () => {
        this.fetchSalesTotalsReport()
    }

    fetNonDateBasedReports = () => {
        this.fetchOrdersTotalsReport()
        this.fetchCustomersTotalsReport()
        this.fetchReviewsTotalsReport()
        this.fetchProductsTotalsReport()
        this.fetchCouponsTotalsReport()
    }

    fetchSalesTotalsReport = () => {
        const { base_url, c_key, c_secret } = this.state;
        let url = `${base_url}/wp-json/wc/v3/reports/sales?consumer_key=${c_key}&consumer_secret=${c_secret}`;
        if (this.state.fromDate) {
            url += `&date_min=${moment(this.state.fromDate).format('YYYY-MM-DD')}`
        }
        if (this.state.toDate) {
            url += `&date_max=${moment(this.state.toDate).format('YYYY-MM-DD')}`
        }
        this.setState({ isSalesTotalsReportDataReady: false });
        fetch(url).then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    salesTotalsReportData: responseJson,
                    error: responseJson.code || null,
                    loading: false
                }, () => {
                    if (Array.isArray(this.state.salesTotalsReportData)
                        && this.state.salesTotalsReportData.length
                        && 'total_sales' in this.state.salesTotalsReportData[0]) {
                        this.setState({
                            isSalesTotalsReportDataReady: true
                        })
                    } else {
                        this.setState({
                            isSalesTotalsReportDataReady: false
                        })
                    }
                });
            }).catch((error) => {
                this.setState({
                    error,
                    isSalesTotalsReportDataReady: false
                })
            });
    }

    fetchOrdersTotalsReport = () => {
        const { base_url, c_key, c_secret } = this.state;
        const url = `${base_url}/wp-json/wc/v3/reports/orders/totals?consumer_key=${c_key}&consumer_secret=${c_secret}`;
        this.setState({ isOrdersTotalsReportDataReady: false });
        fetch(url).then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    ordersTotalsReportData: responseJson,
                    error: responseJson.code || null,
                    loading: false
                }, () => {
                    if (Array.isArray(this.state.ordersTotalsReportData)
                        && this.state.ordersTotalsReportData.length
                        && 'slug' in this.state.ordersTotalsReportData[0]) {
                        this.setState({
                            isOrdersTotalsReportDataReady: true
                        })
                    } else {
                        this.setState({
                            isOrdersTotalsReportDataReady: false
                        })
                    }
                });
            }).catch((error) => {
                this.setState({
                    error,
                    isOrdersTotalsReportDataReady: false
                })
            });
    }

    fetchCustomersTotalsReport = () => {
        const { base_url, c_key, c_secret } = this.state;
        const url = `${base_url}/wp-json/wc/v3/reports/customers/totals?consumer_key=${c_key}&consumer_secret=${c_secret}`;
        this.setState({ isCustomersTotalsReportDataReady: false });
        fetch(url).then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    customersTotalsReportData: responseJson,
                    error: responseJson.code || null,
                    loading: false
                }, () => {
                    if (Array.isArray(this.state.customersTotalsReportData)
                        && this.state.customersTotalsReportData.length
                        && 'slug' in this.state.customersTotalsReportData[0]) {
                        this.setState({
                            isCustomersTotalsReportDataReady: true
                        })
                    } else {
                        this.setState({
                            isCustomersTotalsReportDataReady: false
                        })
                    }
                });
            }).catch((error) => {
                this.setState({
                    error,
                    isCustomersTotalsReportDataReady: false
                })
            });
    }

    fetchReviewsTotalsReport = () => {
        const { base_url, c_key, c_secret } = this.state;
        const url = `${base_url}/wp-json/wc/v3/reports/reviews/totals?consumer_key=${c_key}&consumer_secret=${c_secret}`;
        this.setState({ isReviewsTotalsReportDataReady: false });
        fetch(url).then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    reviewsTotalsReportData: responseJson,
                    error: responseJson.code || null,
                    loading: false
                }, () => {
                    if (Array.isArray(this.state.reviewsTotalsReportData)
                        && this.state.reviewsTotalsReportData.length
                        && 'slug' in this.state.reviewsTotalsReportData[0]) {
                        this.setState({
                            isReviewsTotalsReportDataReady: true
                        })
                    } else {
                        this.setState({
                            isReviewsTotalsReportDataReady: false
                        })
                    }
                });
            }).catch((error) => {
                this.setState({
                    error,
                    isReviewsTotalsReportDataReady: false
                })
            });
    }

    fetchProductsTotalsReport = () => {
        const { base_url, c_key, c_secret } = this.state;
        const url = `${base_url}/wp-json/wc/v3/reports/products/totals?consumer_key=${c_key}&consumer_secret=${c_secret}`;
        this.setState({ isProductsTotalsReportDataReady: false });
        fetch(url).then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    productsTotalsReportData: responseJson,
                    error: responseJson.code || null,
                    loading: false
                }, () => {
                    if (Array.isArray(this.state.productsTotalsReportData)
                        && this.state.productsTotalsReportData.length
                        && 'slug' in this.state.productsTotalsReportData[0]) {
                        this.setState({
                            isProductsTotalsReportDataReady: true
                        })
                    } else {
                        this.setState({
                            isProductsTotalsReportDataReady: false
                        })
                    }
                });
            }).catch((error) => {
                this.setState({
                    error,
                    isProductsTotalsReportDataReady: false
                })
            });
    }

    fetchCouponsTotalsReport = () => {
        const { base_url, c_key, c_secret } = this.state;
        const url = `${base_url}/wp-json/wc/v3/reports/coupons/totals?consumer_key=${c_key}&consumer_secret=${c_secret}`;
        this.setState({ isCouponsTotalsReportDataReady: false });
        fetch(url).then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    couponsTotalsReportData: responseJson,
                    error: responseJson.code || null,
                    loading: false
                }, () => {
                    if (Array.isArray(this.state.couponsTotalsReportData)
                        && this.state.couponsTotalsReportData.length
                        && 'slug' in this.state.couponsTotalsReportData[0]) {
                        this.setState({
                            isCouponsTotalsReportDataReady: true
                        })
                    } else {
                        this.setState({
                            isCouponsTotalsReportDataReady: false
                        })
                    }
                });
            }).catch((error) => {
                this.setState({
                    error,
                    isCouponsTotalsReportDataReady: false
                })
            });
    }

    //Display Functions Below

    displayDateSelector = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>Select Date</Text>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={() => this.setState({
                                showFromDateSelector: !this.state.showFromDateSelector
                            })}>
                            <Text>
                                {this.state.showFromDateSelector
                                    ? 'Select Date'
                                    : moment(this.state.fromDate).format('Do MMM YYYY')
                                }
                            </Text>
                        </TouchableOpacity>
                        {this.state.showFromDateSelector && <DateTimePicker
                            value={this.state.fromDate}
                            mode='date'
                            onChange={(event, date) => {
                                date = date ? date : this.state.fromDate;
                                this.setState({
                                    showFromDateSelector: false,
                                    fromDate: date
                                }, () => this.fetchDateBasedReports())
                            }}
                        />}
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={() => this.setState({
                                showToDateSelector: !this.state.showToDateSelector
                            })}>
                            <Text>
                                {
                                    this.state.showToDateSelector
                                        ? 'Select Date'
                                        : moment(this.state.toDate).format('Do MMM YYYY')
                                }
                            </Text>
                        </TouchableOpacity>
                        {this.state.showToDateSelector && <DateTimePicker
                            value={this.state.toDate}
                            mode='date'
                            onChange={(event, date) => {
                                date = date ? date : this.state.toDate;
                                this.setState({
                                    showToDateSelector: false,
                                    toDate: date
                                }, () => this.fetchDateBasedReports())
                            }}
                        />}
                    </View>
                </View>
            </View>
        )
    }

    displaySalesTotalsReportSection = () => {
        let salesByDateData = []
        let ordersByDateData = []
        let itemsByDateData = []
        let customersByDateData = []
        if (this.state.isSalesTotalsReportDataReady) {
            Object.keys(this.state.salesTotalsReportData[0].totals).forEach(key => {
                salesByDateData.push({
                    "x": key,
                    "y": Number(this.state.salesTotalsReportData[0].totals[key].sales)
                })
                ordersByDateData.push({
                    "x": key,
                    "y": Number(this.state.salesTotalsReportData[0].totals[key].orders)
                })
                itemsByDateData.push({
                    "x": key,
                    "y": Number(this.state.salesTotalsReportData[0].totals[key].items)
                })
                customersByDateData.push({
                    "x": key,
                    "y": Number(this.state.salesTotalsReportData[0].totals[key].customers)
                })
            })
        }

        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>Total Sales Within Selected Dates</Text>
                {
                    this.state.isSalesTotalsReportDataReady
                        ? <>
                            <Text>Total Sales: {this.state.salesTotalsReportData[0].total_sales}</Text>
                            <Text>Net Sales: {this.state.salesTotalsReportData[0].net_sales}</Text>
                            <Text>Average Sales: {this.state.salesTotalsReportData[0].average_sales}</Text>
                            <Text>Total Orders: {this.state.salesTotalsReportData[0].total_orders}</Text>
                            <Text>Total Items: {this.state.salesTotalsReportData[0].total_items}</Text>
                            <Text>Total Shipping: {this.state.salesTotalsReportData[0].total_shipping}</Text>
                            <Text>Total Refund: {this.state.salesTotalsReportData[0].total_refunds}</Text>
                            <Text>Total Discount: {this.state.salesTotalsReportData[0].total_discount}</Text>
                            <Text>Total Customers: {this.state.salesTotalsReportData[0].total_customers}</Text>
                            <View style={styles.graphsView}>
                                <VictoryChart
                                    domainPadding={10}
                                    padding={{ left: 60, bottom: 50, right: 50, top: 20 }}
                                >
                                    <VictoryAxis
                                        label='Sales'
                                        axisLabelComponent={<VictoryLabel dy={-15} />}
                                        style={{
                                            axis: { stroke: 'black' },
                                            axisLabel: { fontSize: 16, fill: 'black' },
                                            ticks: { stroke: 'black' },
                                            tickLabels: {
                                                fontSize: 12, fill: 'black'
                                                , angle: -45
                                            },
                                            grid: { stroke: 'gray', strokeWidth: 0.25 }
                                        }}
                                        dependentAxis
                                    />
                                    <VictoryAxis
                                        label='Date'
                                        style={{
                                            axis: { stroke: 'black' },
                                            axisLabel: { fontSize: 16, fill: 'black' },
                                            ticks: { stroke: 'none' },
                                            tickLabels: { fill: 'none' },
                                        }}
                                    />
                                    <VictoryBar
                                        data={salesByDateData}
                                        x='x'
                                        y='y'
                                        style={{
                                            data: { fill: '#96588a' }
                                        }}
                                        barRatio={1}
                                        horizontal={false}
                                    />
                                </VictoryChart>
                            </View>
                            <View style={styles.graphsView}>
                                <VictoryChart
                                    domainPadding={10}
                                    padding={{ left: 60, bottom: 50, right: 50, top: 20 }}
                                >
                                    <VictoryAxis
                                        label='Orders'
                                        axisLabelComponent={<VictoryLabel dy={-15} />}
                                        style={{
                                            axis: { stroke: 'black' },
                                            axisLabel: { fontSize: 16, fill: 'black' },
                                            ticks: { stroke: 'black' },
                                            tickLabels: {
                                                fontSize: 12, fill: 'black'
                                                , angle: -45
                                            },
                                            grid: { stroke: 'gray', strokeWidth: 0.25 }
                                        }}
                                        dependentAxis
                                    />
                                    <VictoryAxis
                                        label='Date'
                                        style={{
                                            axis: { stroke: 'black' },
                                            axisLabel: { fontSize: 16, fill: 'black' },
                                            ticks: { stroke: 'none' },
                                            tickLabels: { fill: 'none' },
                                        }}
                                    />
                                    <VictoryBar
                                        data={ordersByDateData}
                                        x='x'
                                        y='y'
                                        style={{
                                            data: { fill: '#96588a' }
                                        }}
                                        barRatio={1}
                                        horizontal={false}
                                    />
                                </VictoryChart>
                            </View>
                            <View style={styles.graphsView}>
                                <VictoryChart
                                    domainPadding={10}
                                    padding={{ left: 60, bottom: 50, right: 50, top: 20 }}
                                >
                                    <VictoryAxis
                                        label='Items'
                                        axisLabelComponent={<VictoryLabel dy={-15} />}
                                        style={{
                                            axis: { stroke: 'black' },
                                            axisLabel: { fontSize: 16, fill: 'black' },
                                            ticks: { stroke: 'black' },
                                            tickLabels: {
                                                fontSize: 12, fill: 'black'
                                                , angle: -45
                                            },
                                            grid: { stroke: 'gray', strokeWidth: 0.25 }
                                        }}
                                        dependentAxis
                                    />
                                    <VictoryAxis
                                        label='Date'
                                        style={{
                                            axis: { stroke: 'black' },
                                            axisLabel: { fontSize: 16, fill: 'black' },
                                            ticks: { stroke: 'none' },
                                            tickLabels: { fill: 'none' },
                                        }}
                                    />
                                    <VictoryBar
                                        data={itemsByDateData}
                                        x='x'
                                        y='y'
                                        style={{
                                            data: { fill: '#96588a' }
                                        }}
                                        barRatio={1}
                                        horizontal={false}
                                    />
                                </VictoryChart>
                            </View>
                            <View style={styles.graphsView}>
                                <VictoryChart
                                    domainPadding={10}
                                    padding={{ left: 60, bottom: 50, right: 50, top: 20 }}
                                >
                                    <VictoryAxis
                                        label='Customers'
                                        axisLabelComponent={<VictoryLabel dy={-15} />}
                                        style={{
                                            axis: { stroke: 'black' },
                                            axisLabel: { fontSize: 16, fill: 'black' },
                                            ticks: { stroke: 'black' },
                                            tickLabels: {
                                                fontSize: 12, fill: 'black'
                                                , angle: -45
                                            },
                                            grid: { stroke: 'gray', strokeWidth: 0.25 }
                                        }}
                                        dependentAxis
                                    />
                                    <VictoryAxis
                                        label='Date'
                                        style={{
                                            axis: { stroke: 'black' },
                                            axisLabel: { fontSize: 16, fill: 'black' },
                                            ticks: { stroke: 'none' },
                                            tickLabels: { fill: 'none' },
                                        }}
                                    />
                                    <VictoryBar
                                        data={customersByDateData}
                                        x='x'
                                        y='y'
                                        style={{
                                            data: { fill: '#96588a' }
                                        }}
                                        barRatio={1}
                                        horizontal={false}
                                    />
                                </VictoryChart>
                            </View>
                        </>
                        : <View style={{
                            flex: -1, justifyContent: "center",
                            alignContent: "center", padding: 20
                        }}>
                            <ActivityIndicator color='#96588a' size='large' />
                        </View>
                }
            </View>
        )
    }

    displayOrdersTotalsReportSection = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>All Time Total Orders by Status</Text>
                {this.state.isOrdersTotalsReportDataReady
                    ? <View style={styles.graphsView}>
                        <VictoryChart
                            domainPadding={10}
                            padding={{ left: 40, bottom: 90, right: 50, top: 20 }}
                        >
                            <VictoryAxis
                                style={{
                                    axis: { stroke: 'black' },
                                    axisLabel: { fontSize: 16, fill: 'black' },
                                    ticks: { stroke: 'black' },
                                    tickLabels: { fontSize: 12, fill: 'black' },
                                    grid: { stroke: 'gray', strokeWidth: 0.25 }
                                }} dependentAxis
                            />
                            <VictoryAxis
                                style={{
                                    axis: { stroke: 'black' },
                                    axisLabel: { fontSize: 16, fill: 'black' },
                                    ticks: { stroke: 'black' },
                                    tickLabels: {
                                        fontSize: 12, fill: 'black', verticalAnchor: 'middle',
                                        textAnchor: 'start', angle: 45
                                    }
                                }}
                            />
                            <VictoryBar
                                data={this.state.ordersTotalsReportData}
                                x='name'
                                y='total'
                                labels={({ datum }) => datum._y}
                                style={{
                                    data: { fill: '#96588a' },
                                    labels: { fill: 'black' }
                                }}
                                barRatio={1}
                                horizontal={false}
                            />
                        </VictoryChart>
                    </View>
                    : <View style={{
                        flex: -1, justifyContent: "center",
                        alignContent: "center", padding: 20
                    }}>
                        <ActivityIndicator color='#96588a' size='large' />
                    </View>}
            </View >
        )
    }

    displayCustomersTotalsReportSection = () => {
        let customersTotalsReportDataArray = []
        this.state.customersTotalsReportData.forEach(item => {
            customersTotalsReportDataArray.push(
                <Text
                    key={`customers_totals_report_${item.slug}`
                    }>
                    {item.name}: {item.total}
                </Text>
            )
        })

        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>All Time Total Customers Report</Text>
                {this.state.isCustomersTotalsReportDataReady
                    ? <View style={styles.graphsView}>
                        <VictoryPie
                            data={this.state.customersTotalsReportData}
                            x='name'
                            y='total'
                            colorScale={['#96588a', '#CBACC5']}
                            labels={({ datum }) => `${datum.name} ${datum._y}`}
                        />
                    </View>
                    : <View style={{
                        flex: -1, justifyContent: "center",
                        alignContent: "center", padding: 20
                    }}>
                        <ActivityIndicator color='#96588a' size='large' />
                    </View>
                }
            </View >
        )
    }

    displayReviewsTotalsReportSection = () => {
        let reviewsTotalsReportDataArray = []
        this.state.reviewsTotalsReportData.forEach(item => {
            reviewsTotalsReportDataArray.push(
                <Text
                    key={`customers_totals_report_${item.slug}`
                    }>
                    {item.name}: {item.total}
                </Text>
            )
        })

        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>All Time Total Reviews Report</Text>
                {this.state.isReviewsTotalsReportDataReady
                    ? reviewsTotalsReportDataArray
                    : <View style={{ flex: -1, justifyContent: "center", alignContent: "center", padding: 20 }}>
                        <ActivityIndicator color='#96588a' size='large' />
                    </View>}
            </View >
        )
    }

    displayProductsTotalsReportSection = () => {
        let productsTotalsReportDataArray = []
        this.state.productsTotalsReportData.forEach(item => {
            productsTotalsReportDataArray.push(
                <Text
                    key={`products_totals_report_${item.slug}`
                    }>
                    {item.name}: {item.total}
                </Text>
            )
        })

        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>All Total Products Report</Text>
                {this.state.isProductsTotalsReportDataReady
                    ? productsTotalsReportDataArray
                    : <View style={{ flex: -1, justifyContent: "center", alignContent: "center", padding: 20 }}>
                        <ActivityIndicator color='#96588a' size='large' />
                    </View>}
            </View >
        )
    }

    displayCouponsTotalsReportSection = () => {
        let couponsTotalsReportDataArray = []
        this.state.couponsTotalsReportData.forEach(item => {
            couponsTotalsReportDataArray.push(
                <Text
                    key={`coupons_totals_report_${item.slug}`
                    }>
                    {item.name}: {item.total}
                </Text>
            )
        })

        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>All Total Coupons Report</Text>
                {this.state.isCouponsTotalsReportDataReady
                    ? couponsTotalsReportDataArray
                    : <View style={{ flex: -1, justifyContent: "center", alignContent: "center", padding: 20 }}>
                        <ActivityIndicator color='#96588a' size='large' />
                    </View>}
            </View >
        )
    }
}

const styles = StyleSheet.create({
    section: {
        marginTop: 15,
        marginLeft: 15,
        marginRight: 15
    },
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    graphsView: {
        flex: -1,
        flexDirection: 'row',
        marginLeft: 15,
        justifyContent: 'center',
        alignItems: 'center'
    }
});