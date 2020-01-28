import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

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
            <ScrollView style={{ flex: 1 }}>
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
        this.fetchOrdersTotalsReport()
        this.fetchCustomersTotalsReport()
        this.fetchReviewsTotalsReport()
        this.fetchProductsTotalsReport()
        this.fetchCouponsTotalsReport()
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

    displayOrdersTotalsReportSection = () => {
        let ordersTotalsReportDataArray = []
        this.state.ordersTotalsReportData.forEach(item => {
            ordersTotalsReportDataArray.push(
                <Text
                    key={`orders_totals_report_${item.slug}`
                    }>
                    {item.name}: {item.total}
                </Text>
            )
        })

        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>Total Orders by Status</Text>
                {this.state.isOrdersTotalsReportDataReady
                    ? ordersTotalsReportDataArray
                    : <View style={{ flex: -1, justifyContent: "center", alignContent: "center", padding: 20 }}>
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
                <Text style={styles.titleText}>Total Customers Report</Text>
                {this.state.isCustomersTotalsReportDataReady
                    ? customersTotalsReportDataArray
                    : <View style={{ flex: -1, justifyContent: "center", alignContent: "center", padding: 20 }}>
                        <ActivityIndicator color='#96588a' size='large' />
                    </View>}
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
                <Text style={styles.titleText}>Total Reviews Report</Text>
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
                <Text style={styles.titleText}>Total Products Report</Text>
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
                <Text style={styles.titleText}>Total Coupons Report</Text>
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
});