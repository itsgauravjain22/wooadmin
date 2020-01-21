import React, { Component } from 'react';
import { StyleSheet, Text, View, Switch, KeyboardAvoidingView, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Picker, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default class EditProduct extends Component {
    constructor(props) {
        super(props);
        productData = this.props.navigation.getParam('productData');
        base_url = this.props.navigation.getParam('base_url');
        c_key = this.props.navigation.getParam('c_key');
        c_secret = this.props.navigation.getParam('c_secret');
        this.state = {
            loading: false,
            error: null,
            name: productData.name,
            sku: productData.sku,
            regularPrice: productData.regular_price,
            salePrice: productData.sale_price,
            dateOnSaleFrom: productData.date_on_sale_from,
            showDateOnSaleFrom: false,
            dateOnSaleTo: productData.date_on_sale_to,
            showDateOnSaleTo: false,
            manageStock: productData.manage_stock,
            stockStatus: productData.stock_status,
            stockQuantity: productData.stock_quantity,
            weight: productData.weight,
            length: productData.dimensions.length,
            width: productData.dimensions.width,
            height: productData.dimensions.height,
            productType: productData.type,
            virtual: productData.virtual,
            downloadable: productData.downloadable,
        };
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Edit Product',
            headerStyle: {
                backgroundColor: '#96588a',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        };
    };

    render() {
        if (this.state.loading) {
            return (
                <View style={{ flex: 1, justifyContent: "center", alignContent: "center", padding: 20 }}>
                    <ActivityIndicator color='#96588a' size='large' />
                </View>
            )
        }

        return (
            <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior="padding" enabled>
                <ScrollView>
                    <View style={styles.section}>
                        <Text>Product Name</Text>
                        <TextInput
                            style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
                            onChangeText={this.handlleProductName}
                            value={this.state.name}
                        />
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.titleText}>Pricing</Text>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}>
                                <Text>Regular Price: </Text>
                            </View>
                            <View style={{ flex: 2 }}>
                                <TextInput
                                    style={{ height: 30, borderBottomColor: 'gray', borderBottomWidth: 1 }}
                                    keyboardType='numeric'
                                    value={this.state.regularPrice}
                                    onChangeText={this.handleRegularPrice}
                                />
                            </View>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}>
                                <Text>Sale Price: </Text>
                            </View>
                            <View style={{ flex: 2 }}>
                                <TextInput
                                    style={{ height: 30, borderBottomColor: 'gray', borderBottomWidth: 1 }}
                                    keyboardType='numeric'
                                    value={this.state.salePrice}
                                    onChangeText={this.handleSalePrice}
                                />
                            </View>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row' }}>
                            <View style={{
                                flex: 2
                            }}>
                                <Text>Sale Date From: </Text>
                            </View>
                            <View style={{ flex: 2 }}>
                                <TouchableOpacity onPress={this.handleShowDateOnSaleFrom}>
                                    <Text>{this.state.dateOnSaleFrom ? new Date(this.state.dateOnSaleFrom).toDateString() : 'Select Date'}</Text>
                                </TouchableOpacity>
                                {this.state.showDateOnSaleFrom && <DateTimePicker
                                    value={this.state.dateOnSaleFrom ? new Date(this.state.dateOnSaleFrom) : new Date()}
                                    mode='date'
                                    onChange={this.handleDateOnSaleFrom}
                                />}
                            </View>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row' }}>
                            <View style={{
                                flex: 2
                            }}>
                                <Text>Sale Date To: </Text>
                            </View>
                            <View style={{ flex: 2 }}>
                                <TouchableOpacity onPress={this.handleShowDateOnSaleTo}>
                                    <Text>{this.state.dateOnSaleTo ? new Date(this.state.dateOnSaleTo).toDateString() : 'Select Date'}</Text>
                                </TouchableOpacity>
                                {this.state.showDateOnSaleTo && <DateTimePicker
                                    value={this.state.dateOnSaleTo ? new Date(this.state.dateOnSaleTo) : new Date()}
                                    mode='date'
                                    onChange={this.handleDateOnSaleTo}
                                />}
                            </View>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.titleText}>Inventory</Text>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}>
                                <Text>Manage Stock: </Text>
                            </View>
                            <View style={{ flex: 2 }}>
                                <Switch
                                    thumbColor={'#96588a'}
                                    trackColor={{ true: '#D5BCD0' }}
                                    value={this.state.manageStock}
                                    onValueChange={this.handleManageStock}
                                />
                            </View>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}>
                                <Text>Stock Status: </Text>
                            </View>
                            <View style={{ flex: 2 }}>
                                <Picker
                                    mode='dropdown'
                                    selectedValue={this.state.stock_status}
                                    onValueChange={this.handleStockStatus}
                                >
                                    <Picker.Item label="In Stock" value="instock" />
                                    <Picker.Item label="Out of Stock" value="outofstock" />
                                    <Picker.Item label="On Backorder" value="onbackorder" />
                                </Picker>
                            </View>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}>
                                <Text>Stock Quantity: </Text>
                            </View>
                            <View style={{ flex: 2 }}>
                                <TextInput
                                    style={{ height: 30, borderBottomColor: 'gray', borderBottomWidth: 1 }}
                                    keyboardType='numeric'
                                    value={this.state.stockQuantity ? this.state.stockQuantity.toString() : null}
                                    onChangeText={this.handleStockQuantity}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.titleText}>Shipping</Text>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}>
                                <Text>Weight: </Text>
                            </View>
                            <View style={{ flex: 2 }}>
                                <TextInput
                                    style={{ height: 30, borderBottomColor: 'gray', borderBottomWidth: 1 }}
                                    keyboardType='numeric'
                                    value={this.state.weight}
                                    onChangeText={this.handleWeight}
                                />
                            </View>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}>
                                <Text>Length: </Text>
                            </View>
                            <View style={{ flex: 2 }}>
                                <TextInput
                                    style={{ height: 30, borderBottomColor: 'gray', borderBottomWidth: 1 }}
                                    keyboardType='numeric'
                                    value={this.state.length}
                                    onChangeText={this.handleLength}
                                />
                            </View>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}>
                                <Text>Width: </Text>
                            </View>
                            <View style={{ flex: 2 }}>
                                <TextInput
                                    style={{ height: 30, borderBottomColor: 'gray', borderBottomWidth: 1 }}
                                    keyboardType='numeric'
                                    value={this.state.width}
                                    onChangeText={this.handleWidth}
                                />
                            </View>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}>
                                <Text>Height: </Text>
                            </View>
                            <View style={{ flex: 2 }}>
                                <TextInput
                                    style={{ height: 30, borderBottomColor: 'gray', borderBottomWidth: 1 }}
                                    keyboardType='numeric'
                                    value={this.state.height}
                                    onChangeText={this.handleHeight}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.titleText}>Type</Text>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}>
                                <Text>Product Type: </Text>
                            </View>
                            <View style={{ flex: 2 }}>
                                <Picker mode='dropdown'
                                    selectedValue={this.state.type}
                                    onValueChange={this.handleProductType}
                                >
                                    <Picker.Item label="In Stock" value="simple" />
                                    <Picker.Item label="Out of Stock" value="variable" />
                                    <Picker.Item label="On Backorder" value="grouped" />
                                    <Picker.Item label="On Backorder" value="external" />
                                </Picker>
                            </View>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}>
                                <Text>Virtual: </Text>
                            </View>
                            <View style={{ flex: 2 }}>
                                <Switch
                                    thumbColor={'#96588a'}
                                    trackColor={{ true: '#D5BCD0' }}
                                    value={this.state.virtual}
                                    onValueChange={this.handleVirtual}
                                />
                            </View>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10, marginRight: 10, flexDirection: 'row' }}>
                            <View style={{ flex: 2 }}>
                                <Text>Downloadable: </Text>
                            </View>
                            <View style={{ flex: 2 }}>
                                <Switch
                                    thumbColor={'#96588a'}
                                    trackColor={{ true: '#D5BCD0' }}
                                    value={this.state.downloadable}
                                    onValueChange={this.handleDownloadable}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <Button
                    title="Submit"
                    color="#96588a"
                    onPress={this.handleSubmit}
                />
            </KeyboardAvoidingView>
        );
    }

    handlleProductName = (text) => {
        this.setState({ name: text.toString() });
    }

    handleRegularPrice = (value) => {
        if (!isNaN(value)) {
            this.setState({ regularPrice: value });
        }
    }

    handleSalePrice = (value) => {
        if (!isNaN(value)) {
            this.setState({ salePrice: value });
        }
    }

    handleShowDateOnSaleFrom = () => {
        this.setState({
            showDateOnSaleFrom: true
        })
    }

    handleDateOnSaleFrom = (event, date) => {
        date = (date ? date.toISOString() : null) || this.state.date;
        this.setState({
            showDateOnSaleFrom: Platform.OS === 'ios' ? true : false,
            dateOnSaleFrom: date,
        })
    }

    handleShowDateOnSaleTo = () => {
        this.setState({
            showDateOnSaleTo: true
        })
    }

    handleDateOnSaleTo = (event, date) => {
        date = (date ? date.toISOString() : null) || this.state.date;
        this.setState({
            showDateOnSaleTo: Platform.OS === 'ios' ? true : false,
            dateOnSaleTo: date,
        })
    }

    handleManageStock = (value) => {
        this.setState({ manageStock: value })
    }

    handleStockStatus = (value) => {
        this.setState({ stockStatus: value.toString() })
    }

    handleStockQuantity = (value) => {
        if (!isNaN(value)) {
            this.setState({ stockQuantity: parseInt(value) });
        }
    }

    handleWeight = (value) => {
        if (!this.isNaN(value)) {
            this.setState({ weight: value })
        }
    }

    handleLength = (value) => {
        if (!isNaN(value)) {
            this.setState({ length: value })
        }
    }

    handleWidth = (value) => {
        if (!isNaN(value)) {
            this.setState({ width: value })
        }
    }

    handleHeight = (value) => {
        if (!isNaN(value)) {
            this.setState({ height: value })
        }
    }

    handleProductType = (value) => {
        this.setState({ productType: value.toString() })
    }

    handleVirtual = (value) => {
        this.setState({ virtual: value })
    }

    handleDownloadable = (value) => {
        this.setState({ downloadable: value })
    }

    handleSubmit = () => {
        let updatedProductObject = {
            "name": this.state.name,
            "sku": this.state.sku,
            "regular_price": this.state.regularPrice,
            "sale_price": this.state.salePrice,
            "date_on_sale_from": this.state.dateOnSaleFrom,
            "date_on_sale_to": this.state.dateOnSaleTo,
            "manage_stock": this.state.manageStock,
            "stock_status": this.state.stockStatus,
            "stock_quantity": this.state.stockQuantity,
            "dimensions": { "weight": this.state.weight, "length": this.state.length, "height": this.state.height },
            "type": this.state.productType,
            "virtual": this.state.virtual,
            "downloadable": this.state.downloadable,
        };

        const id = productData.id;
        const url = `${base_url}/wp-json/wc/v3/products/${id}?consumer_key=${c_key}&consumer_secret=${c_secret}`;
        this.setState({ loading: true });
        fetch(url, {
            method: 'PUT',
            body: JSON.stringify(updatedProductObject),
        }).then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    error: responseJson.code || null,
                    loading: false,
                });
            }).catch((error) => {
                this.setState({
                    error,
                    loading: false,
                })
            });
    }
}

const styles = StyleSheet.create({
    section: {
        marginTop: 20,
        marginLeft: 20,
        marginRight: 20,
    },
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});