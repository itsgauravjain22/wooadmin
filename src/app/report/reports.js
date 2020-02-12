import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, RefreshControl, ActivityIndicator, ToastAndroid } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { VictoryChart, VictoryBar, VictoryPie, VictoryAxis, VictoryLabel } from 'victory-native';
import moment from 'moment';

const config = require('../../../config.json');

export default class Reports extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Reports',
            headerRight: () => (
                <TouchableOpacity
                    style={{ paddingRight: 20 }}
                    onPress={() => { navigation.navigate("Settings") }}
                >
                    <Ionicons name='md-more' size={25} color={config.colors.iconLightColor} />
                </TouchableOpacity>
            ),
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
                {this.displayError()}
                {this.displayDateBasedReports()}
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
        if (config.permissions.reports.orders) {
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
    }

    fetchCustomersTotalsReport = () => {
        if (config.permissions.reports.customers) {
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
    }

    fetchReviewsTotalsReport = () => {
        if (config.permissions.reports.reviews) {
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
    }

    fetchProductsTotalsReport = () => {
        if (config.permissions.reports.products) {
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
    }

    fetchCouponsTotalsReport = () => {
        if (config.permissions.reports.coupons) {
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
    }

    //Display Functions Below

    displayError = () => {
        if (this.state.error) {
            ToastAndroid.show(`Error: ${this.state.error}`, ToastAndroid.LONG);
        }
    }

    displayDateBasedReports = () => {
        return (
            <>
                {this.displayDateSelector()}
                {this.displaySummaryWithinDatesReportSection()}
                {this.displayTotalSalesWithinDatesReportSection()}
                {this.displayTotalOrdersWithinDatesReportSection()}
                {this.displayTotalCustomersWithinDatesReportSection()}
                {this.displayTotalItemsWithinDatesReportSection()}
            </>
        )
    }

    displayDateSelector = () => {
        if ( config.permissions.reports.summary || config.permissions.reports.sales || 
            config.permissions.reports.orders || config.permissions.reports.products) {
            return (
                <View style={styles.section}>
                    <Text style={styles.titleText}>Reports By Dates</Text>
                    <Text style={[styles.h2Text, { marginTop: 10 }]}>Select Date</Text>
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
    }

    displaySummaryWithinDatesReportSection = () => {
        if (config.permissions.reports.summary) {
            return (
                <View style={styles.section}>
                    <Text style={styles.h2Text}>Summary</Text>
                    {this.state.isSalesTotalsReportDataReady
                        ? <>
                            <Text>Total Shipping: {this.state.salesTotalsReportData[0].total_shipping}</Text>
                            <Text>Total Refund: {this.state.salesTotalsReportData[0].total_refunds}</Text>
                            <Text>Total Discount: {this.state.salesTotalsReportData[0].total_discount}</Text>
                        </>
                        : <View style={{
                            flex: -1, justifyContent: "center",
                            alignContent: "center", padding: 20
                        }}>
                            <ActivityIndicator color={config.colors.loadingColor} size='large' />
                        </View>
                    }
                </View >
            )
        } else return <></>
    }

    displayTotalSalesWithinDatesReportSection = () => {
        if (config.permissions.reports.sales) {
            let salesByDateData = []
            if (this.state.isSalesTotalsReportDataReady) {
                Object.keys(this.state.salesTotalsReportData[0].totals).forEach(key => {
                    salesByDateData.push({
                        "x": key,
                        "y": Number(this.state.salesTotalsReportData[0].totals[key].sales)
                    })
                })
            }

            return (
                <View style={styles.section}>
                    <Text style={styles.h2Text}>Sales</Text>
                    {this.state.isSalesTotalsReportDataReady
                        ? <>
                            <Text>Total Sales: {this.state.salesTotalsReportData[0].total_sales}</Text>
                            <Text>Net Sales: {this.state.salesTotalsReportData[0].net_sales}</Text>
                            <Text>Average Sales: {this.state.salesTotalsReportData[0].average_sales}</Text>
                            <Text>Total Shipping: {this.state.salesTotalsReportData[0].total_shipping}</Text>
                            <Text>Total Refund: {this.state.salesTotalsReportData[0].total_refunds}</Text>
                            <Text>Total Discount: {this.state.salesTotalsReportData[0].total_discount}</Text>
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
                                        labels={({ datum }) => datum._y}
                                        style={{
                                            data: { fill: config.colors.barChartDataColor },
                                            labels: { fill: 'black' }
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
                            <ActivityIndicator color={config.colors.loadingColor} size='large' />
                        </View>
                    }
                </View >
            )
        } else {
            return <></>
        }
    }

    displayTotalOrdersWithinDatesReportSection = () => {
        if (config.permissions.reports.orders) {
            let ordersByDateData = []
            if (this.state.isSalesTotalsReportDataReady) {
                Object.keys(this.state.salesTotalsReportData[0].totals).forEach(key => {
                    ordersByDateData.push({
                        "x": key,
                        "y": Number(this.state.salesTotalsReportData[0].totals[key].orders)
                    })
                })
            }
            return (
                <View style={styles.section}>
                    <Text style={styles.h2Text}>Orders</Text>
                    {this.state.isSalesTotalsReportDataReady
                        ? <>
                            <Text>Total Orders: {this.state.salesTotalsReportData[0].total_orders}</Text>
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
                                        labels={({ datum }) => datum._y}
                                        style={{
                                            data: { fill: config.colors.barChartDataColor },
                                            labels: { fill: 'black' }
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
                            <ActivityIndicator color={config.colors.loadingColor} size='large' />
                        </View>
                    }
                </View >
            )
        } else {
            return <></>
        }
    }

    displayTotalCustomersWithinDatesReportSection = () => {
        if (config.permissions.reports.customers) {
            let customersByDateData = []
            if (this.state.isSalesTotalsReportDataReady) {
                Object.keys(this.state.salesTotalsReportData[0].totals).forEach(key => {
                    customersByDateData.push({
                        "x": key,
                        "y": Number(this.state.salesTotalsReportData[0].totals[key].customers)
                    })
                })
            }

            return (
                <View style={styles.section}>
                    <Text style={styles.h2Text}>Customers</Text>
                    {this.state.isSalesTotalsReportDataReady
                        ? <>
                            <Text>Total Customers: {this.state.salesTotalsReportData[0].total_customers}</Text>
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
                                        labels={({ datum }) => datum._y}
                                        style={{
                                            data: { fill: config.colors.barChartDataColor },
                                            labels: { fill: 'black' }
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
                            <ActivityIndicator color={config.colors.loadingColor} size='large' />
                        </View>
                    }
                </View >
            )
        }
        return <></>
    }

    displayTotalItemsWithinDatesReportSection = () => {
        if (config.permissions.reports.products) {
            let itemsByDateData = []
            if (this.state.isSalesTotalsReportDataReady) {
                Object.keys(this.state.salesTotalsReportData[0].totals).forEach(key => {
                    itemsByDateData.push({
                        "x": key,
                        "y": Number(this.state.salesTotalsReportData[0].totals[key].items)
                    })
                })
            }

            return (
                <View style={styles.section}>
                    <Text style={styles.h2Text}>Product Items</Text>
                    {this.state.isSalesTotalsReportDataReady
                        ? <>
                            <Text>Total Items: {this.state.salesTotalsReportData[0].total_items}</Text>
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
                                        labels={({ datum }) => datum._y}
                                        style={{
                                            data: { fill: config.colors.barChartDataColor },
                                            labels: { fill: 'black' }
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
                            <ActivityIndicator color={config.colors.loadingColor} size='large' />
                        </View>
                    }
                </View >
            )
        }
    }

    displayOrdersTotalsReportSection = () => {
        if (config.permissions.reports.orders) {
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
                                        data: { fill: config.colors.barChartDataColor },
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
                            <ActivityIndicator color={config.colors.loadingColor} size='large' />
                        </View>}
                </View >
            )
        } else return <></>
    }

    displayCustomersTotalsReportSection = () => {
        if (config.permissions.reports.customers) {
            let customersTotalsReportDataArray = []
            if (this.state.isCustomersTotalsReportDataReady) {
                this.state.customersTotalsReportData.forEach(item => {
                    customersTotalsReportDataArray.push(
                        <Text
                            key={`customers_totals_report_${item.slug}`
                            }>
                            {item.name}: {item.total}
                        </Text>
                    )
                })
            }

            return (
                <View style={styles.section}>
                    <Text style={styles.titleText}>All Time Total Customers Report</Text>
                    {this.state.isCustomersTotalsReportDataReady
                        ? <View style={styles.graphsView}>
                            <VictoryPie
                                data={this.state.customersTotalsReportData}
                                x='name'
                                y='total'
                                colorScale={config.colors.pieChartDataColors}
                                labels={({ datum }) => `${datum.name} ${datum._y}`}
                            />
                        </View>
                        : <View style={{
                            flex: -1, justifyContent: "center",
                            alignContent: "center", padding: 20
                        }}>
                            <ActivityIndicator color={config.colors.loadingColor} size='large' />
                        </View>
                    }
                </View >
            )
        } else return <></>
    }

    displayReviewsTotalsReportSection = () => {
        if (config.permissions.reports.reviews) {
            let reviewsTotalsReportDataArray = []
            if (this.state.isReviewsTotalsReportDataReady) {
                this.state.reviewsTotalsReportData.forEach(item => {
                    reviewsTotalsReportDataArray.push(
                        <Text
                            key={`customers_totals_report_${item.slug}`
                            }>
                            {item.name}: {item.total}
                        </Text>
                    )
                })
            }

            return (
                <View style={styles.section}>
                    <Text style={styles.titleText}>All Time Total Reviews Report</Text>
                    {this.state.isReviewsTotalsReportDataReady
                        ? reviewsTotalsReportDataArray
                        : <View style={{ flex: -1, justifyContent: "center", alignContent: "center", padding: 20 }}>
                            <ActivityIndicator color={config.colors.loadingColor} size='large' />
                        </View>}
                </View >
            )
        } else return <></>
    }

    displayProductsTotalsReportSection = () => {
        if (config.permissions.reports.products) {
            let productsTotalsReportDataArray = []
            if (this.state.isProductsTotalsReportDataReady) {
                this.state.productsTotalsReportData.forEach(item => {
                    productsTotalsReportDataArray.push(
                        <Text
                            key={`products_totals_report_${item.slug}`
                            }>
                            {item.name}: {item.total}
                        </Text>
                    )
                })
            }

            return (
                <View style={styles.section}>
                    <Text style={styles.titleText}>All Total Products Report</Text>
                    {this.state.isProductsTotalsReportDataReady
                        ? productsTotalsReportDataArray
                        : <View style={{ flex: -1, justifyContent: "center", alignContent: "center", padding: 20 }}>
                            <ActivityIndicator color={config.colors.loadingColor} size='large' />
                        </View>}
                </View >
            )
        } else return <></>
    }

    displayCouponsTotalsReportSection = () => {
        if (config.permissions.reports.coupons) {
            let couponsTotalsReportDataArray = []
            if (this.state.isCouponsTotalsReportDataReady) {
                this.state.couponsTotalsReportData.forEach(item => {
                    couponsTotalsReportDataArray.push(
                        <Text
                            key={`coupons_totals_report_${item.slug}`
                            }>
                            {item.name}: {item.total}
                        </Text>
                    )
                })
            }

            return (
                <View style={styles.section}>
                    <Text style={styles.titleText}>All Total Coupons Report</Text>
                    {this.state.isCouponsTotalsReportDataReady
                        ? couponsTotalsReportDataArray
                        : <View style={{ flex: -1, justifyContent: "center", alignContent: "center", padding: 20 }}>
                            <ActivityIndicator color={config.colors.loadingColor} size='large' />
                        </View>}
                </View >
            )
        } else return <></>
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
    h2Text: {
        fontSize: 16,
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