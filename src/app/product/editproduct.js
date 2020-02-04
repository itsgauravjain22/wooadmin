import React, { Component } from 'react';
import {
    StyleSheet, Text, View, Switch, KeyboardAvoidingView, TouchableOpacity,
    ScrollView, ActivityIndicator, TextInput, Picker, ToastAndroid
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MultiSelect from 'react-native-multiple-select';
import GLOBAL from './productglobal'

export default class EditProduct extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Edit Product',
        };
    };

    constructor(props) {
        super(props);
        productData = this.props.navigation.getParam('productData');
        base_url = this.props.navigation.getParam('base_url');
        c_key = this.props.navigation.getParam('c_key');
        c_secret = this.props.navigation.getParam('c_secret');
        let selectedProductCategories = []
        productData.categories.forEach(item => {
            if (item.id) {
                selectedProductCategories.push(item.id.toString())
            }
        })
        this.state = {
            loading: false,
            error: null,
            productCategoriesPage: 1,
            hasMoreProductCategoriesToLoad: true,
            productCategories: [],
            selectedProductCategories: selectedProductCategories,
            name: productData.name,
            sku: productData.sku,
            status: productData.status,
            regularPrice: productData.regular_price,
            salePrice: productData.sale_price,
            dateOnSaleFrom: productData.date_on_sale_from ? productData.date_on_sale_from : "",
            showDateOnSaleFrom: false,
            dateOnSaleTo: productData.date_on_sale_to ? productData.dateOnSaleTo : "",
            showDateOnSaleTo: false,
            manageStock: productData.manage_stock,
            stockStatus: productData.stock_status,
            stockQuantity: productData.stock_quantity,
            weight: productData.weight,
            length: productData.dimensions.length,
            width: productData.dimensions.width,
            height: productData.dimensions.height,
            type: productData.type,
            virtual: productData.virtual,
            downloadable: productData.downloadable,
        };
    }

    componentDidMount() {
        this.fetchAllProductCategories()
    }

    render() {
        if (this.state.loading) {
            return (
                <View style={{ flex: 1, justifyContent: "center", alignContent: "center", padding: 20 }}>
                    <ActivityIndicator color='#96588a' size='large' />
                </View>
            )
        }

        return (
            <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', }} behavior='padding' enabled>
                <ScrollView>
                    {this.displayProductNameSection()}
                    {this.displayProductStatusSection()}
                    {this.displayProductCategoriesSection()}
                    {this.displayProductPricingSection()}
                    {this.displayProductInventorySection()}
                    {this.displayProductShippingSection()}
                    {/* {this.displayProductTypeSection()} */}
                </ScrollView>
                {this.displaySubmitButton()}
            </KeyboardAvoidingView>
        );
    }

    //Fetch Functions Below

    fetchAllProductCategories = () => {
        const url = `${base_url}/wp-json/wc/v3/products/categories?per_page=20&page=${this.state.productCategoriesPage}&consumer_key=${c_key}&consumer_secret=${c_secret}`;
        this.setState({ loading: true });
        fetch(url).then((response) => response.json())
            .then((responseJson) => {
                if (Array.isArray(responseJson) && responseJson.length > 0 && 'id' in responseJson[0]) {
                    responseJson.forEach((item, index) => {
                        responseJson[index].id = item.id.toString()
                    })
                    this.setState({
                        hasMoreProductCategoriesToLoad: true,
                        productCategoriesPage: this.state.productCategoriesPage + 1,
                        productCategories: this.state.productCategories.concat(responseJson),
                    }, this.fetchAllProductCategories);
                } else if (Array.isArray(responseJson) && responseJson.length === 0) {
                    this.setState({
                        hasMoreProductCategoriesToLoad: false,
                        loading: false
                    })
                } else if ('code' in responseJson) {
                    this.setState({
                        error: responseJson.code,
                        loading: false
                    })
                }
            }).catch((error) => {
                this.setState({
                    error,
                    loading: false
                })
            });
    }

    //Display Functions Below

    displayProductNameSection = () => {
        return (
            < View style={styles.section} >
                <Text style={styles.titleText}>Product Name</Text>
                    <TextInput
                        style={{
                            borderColor: 'gray',
                            borderBottomWidth: 1
                        }}
                        textAlign='center'
                        onChangeText={text => {
                            this.setState({
                                name: text.toString()
                            })
                        }}
                        value={this.state.name}
                    />
            </View >
        )
    }

    displayProductStatusSection = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>Status</Text>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionRowLeftCol}>
                        <Text>Status: </Text>
                    </View>
                    <View style={styles.sectionRowRightCol}>
                        <Picker
                            mode='dropdown'
                            selectedValue={this.state.status}
                            onValueChange={text => {
                                this.setState({
                                    status: text.toString()
                                })
                            }}
                        >
                            <Picker.Item label="Publish" value="publish" />
                            <Picker.Item label="Draft" value="draft" />
                            <Picker.Item label="Pending" value="pending" />
                            <Picker.Item label="Private" value="private" />
                        </Picker>
                    </View>
                </View>
            </View>
        )
    }

    displayProductCategoriesSection = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>Categories</Text>
                <View style={{marginLeft: 10, marginRight: 10}}>
                    <MultiSelect
                        items={this.state.productCategories}
                        uniqueKey="id"
                        displayKey="name"
                        onSelectedItemsChange={selectedItems => this.setState({
                            selectedProductCategories: selectedItems
                        })}
                        fixedHeight={false}
                        hideTags
                        ref={(component) => { this.multiSelect = component }}
                        selectedItems={this.state.selectedProductCategories}
                        selectText="Pick Categories"
                        searchInputPlaceholderText="Search Category..."
                        searchInputStyle={{ height: 40, color: 'black' }}
                        itemTextColor='black'
                        selectedItemTextColor='#96588a'
                        selectedItemIconColor='#96588a'
                        submitButtonColor='#96588a'
                        submitButtonText='Update Categories'
                    />
                </View>
            </View>
        )
    }

    displayProductPricingSection = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>Pricing</Text>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionRowLeftCol}>
                        <Text>Regular Price: </Text>
                    </View>
                    <View style={styles.sectionRowRightCol}>
                        <TextInput
                            style={{ height: 30, borderBottomColor: 'gray', borderBottomWidth: 1 }}
                            keyboardType='numeric'
                            textAlign='center'
                            value={this.state.regularPrice}
                            onChangeText={(value) => {
                                if (!isNaN(value)) {
                                    this.setState({ regularPrice: value });
                                }
                            }}
                        />
                    </View>
                </View>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionRowLeftCol}>
                        <Text>Sale Price: </Text>
                    </View>
                    <View style={styles.sectionRowRightCol}>
                        <TextInput
                            style={{ height: 30, borderBottomColor: 'gray', borderBottomWidth: 1 }}
                            keyboardType='numeric'
                            value={this.state.salePrice}
                            textAlign='center'
                            onChangeText={(value) => {
                                if (!isNaN(value)) {
                                    this.setState({ salePrice: value });
                                }
                            }}
                        />
                    </View>
                </View>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionRowLeftCol}>
                        <Text>Sale Date From: </Text>
                    </View>
                    <View style={styles.sectionRowRightCol}>
                        <TouchableOpacity
                            style={{ justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => {
                                this.setState({
                                    showDateOnSaleFrom: true
                                })
                            }}>
                            <Text>{this.state.dateOnSaleFrom ? new Date(this.state.dateOnSaleFrom).toDateString() : 'Select Date'}</Text>
                        </TouchableOpacity>
                        {this.state.showDateOnSaleFrom && <DateTimePicker
                            value={this.state.dateOnSaleFrom ? new Date(this.state.dateOnSaleFrom) : new Date()}
                            mode='date'
                            onChange={(event, date) => {
                                date = date ? date.toISOString() : "";
                                this.setState({
                                    showDateOnSaleFrom: false,
                                    dateOnSaleFrom: date,
                                })
                            }}
                        />}
                    </View>
                </View>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionRowLeftCol}>
                        <Text>Sale Date To: </Text>
                    </View>
                    <View style={styles.sectionRowRightCol}>
                        <TouchableOpacity
                            style={{ justifyContent: 'center', alignItems: 'center' }}
                            onPress={() => {
                                this.setState({
                                    showDateOnSaleTo: true
                                })
                            }}>
                            <Text>{this.state.dateOnSaleTo ? new Date(this.state.dateOnSaleTo).toDateString() : 'Select Date'}</Text>
                        </TouchableOpacity>
                        {this.state.showDateOnSaleTo && <DateTimePicker
                            value={this.state.dateOnSaleTo ? new Date(this.state.dateOnSaleTo) : new Date()}
                            mode='date'
                            onChange={(event, date) => {
                                date = date ? date.toISOString() : "";
                                this.setState({
                                    showDateOnSaleTo: false,
                                    dateOnSaleTo: date,
                                })
                            }}
                        />}
                    </View>
                </View>
            </View>
        )
    }

    displayProductInventorySection = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>Inventory</Text>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionRowLeftCol}>
                        <Text>Stock Status: </Text>
                    </View>
                    <View style={styles.sectionRowRightCol}>
                        <Picker
                            mode='dropdown'
                            selectedValue={this.state.stock_status}
                            onValueChange={(value) => {
                                this.setState({ stockStatus: value.toString() })
                            }}
                        >
                            <Picker.Item label="In Stock" value="instock" />
                            <Picker.Item label="Out of Stock" value="outofstock" />
                            <Picker.Item label="On Backorder" value="onbackorder" />
                        </Picker>
                    </View>
                </View>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionRowLeftCol}>
                        <Text>Manage Stock: </Text>
                    </View>
                    <View style={[styles.sectionRowRightCol, {alignItems: 'center'}]}>
                        <Switch
                            thumbColor={'#96588a'}
                            trackColor={{ true: '#D5BCD0' }}
                            value={this.state.manageStock}
                            onValueChange={(value) => {
                                this.setState({ manageStock: value })
                            }}
                        />
                    </View>
                </View>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionRowLeftCol}>
                        <Text>Stock Quantity: </Text>
                    </View>
                    <View style={styles.sectionRowRightCol}>
                        <TextInput
                            style={{ height: 30, borderBottomColor: 'gray', borderBottomWidth: 1 }}
                            keyboardType='numeric'
                            textAlign='center'
                            value={this.state.stockQuantity ? this.state.stockQuantity.toString() : null}
                            onChangeText={(value) => {
                                if (!isNaN(value)) {
                                    this.setState({ stockQuantity: parseInt(value) });
                                }
                            }}
                        />
                    </View>
                </View>
            </View>
        )
    }

    displayProductShippingSection = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>Shipping</Text>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionRowLeftCol}>
                        <Text>Weight: </Text>
                    </View>
                    <View style={styles.sectionRowRightCol}>
                        <TextInput
                            style={{ height: 30, borderBottomColor: 'gray', borderBottomWidth: 1 }}
                            textAlign='center'
                            keyboardType='numeric'
                            value={this.state.weight}
                            onChangeText={(value) => {
                                if (!isNaN(value)) {
                                    this.setState({ weight: value })
                                }
                            }}
                        />
                    </View>
                </View>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionRowLeftCol}>
                        <Text>Length: </Text>
                    </View>
                    <View style={styles.sectionRowRightCol}>
                        <TextInput
                            style={{ height: 30, borderBottomColor: 'gray', borderBottomWidth: 1 }}
                            keyboardType='numeric'
                            textAlign='center'
                            value={this.state.length}
                            onChangeText={(value) => {
                                if (!isNaN(value)) {
                                    this.setState({ length: value })
                                }
                            }}
                        />
                    </View>
                </View>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionRowLeftCol}>
                        <Text>Width: </Text>
                    </View>
                    <View style={styles.sectionRowRightCol}>
                        <TextInput
                            style={{ height: 30, borderBottomColor: 'gray', borderBottomWidth: 1 }}
                            keyboardType='numeric'
                            textAlign='center'
                            value={this.state.width}
                            onChangeText={(value) => {
                                if (!isNaN(value)) {
                                    this.setState({ width: value })
                                }
                            }}
                        />
                    </View>
                </View>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionRowLeftCol}>
                        <Text>Height: </Text>
                    </View>
                    <View style={styles.sectionRowRightCol}>
                        <TextInput
                            style={{ height: 30, borderBottomColor: 'gray', borderBottomWidth: 1 }}
                            keyboardType='numeric'
                            textAlign='center'
                            value={this.state.height}
                            onChangeText={(value) => {
                                if (!isNaN(value)) {
                                    this.setState({ height: value })
                                }
                            }}
                        />
                    </View>
                </View>
            </View>
        )
    }

    displayProductTypeSection = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>Type</Text>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionRowLeftCol}>
                        <Text>Product Type: </Text>
                    </View>
                    <View style={styles.sectionRowRightCol}>
                        <Picker mode='dropdown'
                            selectedValue={this.state.type}
                            onValueChange={(value) => {
                                this.setState({ type: value.toString() })
                            }}
                        >
                            <Picker.Item label="Simple" value="simple" />
                        </Picker>
                    </View>
                </View>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionRowLeftCol}>
                        <Text>Virtual: </Text>
                    </View>
                    <View style={styles.sectionRowRightCol}>
                        <Switch
                            thumbColor={'#96588a'}
                            trackColor={{ true: '#D5BCD0' }}
                            value={this.state.virtual}
                            onValueChange={(value) => {
                                this.setState({ virtual: value })
                            }}
                        />
                    </View>
                </View>
                <View style={styles.sectionRow}>
                    <View style={styles.sectionRowLeftCol}>
                        <Text>Downloadable: </Text>
                    </View>
                    <View style={styles.sectionRowRightCol}>
                        <Switch
                            thumbColor={'#96588a'}
                            trackColor={{ true: '#D5BCD0' }}
                            value={this.state.downloadable}
                            onValueChange={(value) => {
                                this.setState({ downloadable: value })
                            }}
                        />
                    </View>
                </View>
            </View>
        )
    }

    displaySubmitButton = () => {
        return (
            <TouchableOpacity
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 50,
                    backgroundColor: '#96588a'
                }}
                onPress={this.handleSubmit}
            >
                <Text style={{ color: 'white' }}>Submit</Text>
            </TouchableOpacity>
        )
    }

    //Handle Functions Below

    handleSubmit = () => {
        let updatedProductCategoriesArray = []
        this.state.selectedProductCategories.forEach(id => {
            if (!isNaN(id)) {
                updatedProductCategoriesArray.push({
                    "id": parseInt(id)
                })
            }
        })
        let updatedProductObject = {
            "name": this.state.name,
            "sku": this.state.sku,
            "status": this.state.status,
            "regular_price": this.state.regularPrice,
            "sale_price": this.state.salePrice,
            "date_on_sale_from": this.state.dateOnSaleFrom,
            "date_on_sale_to": this.state.dateOnSaleTo,
            "manage_stock": this.state.manageStock,
            "stock_status": this.state.stockStatus,
            "stock_quantity": this.state.stockQuantity,
            "weight": this.state.weight,
            "dimensions": { "length": this.state.length, "width": this.state.width, "height": this.state.height },
            "type": this.state.type,
            "virtual": this.state.virtual,
            "downloadable": this.state.downloadable,
            "categories": updatedProductCategoriesArray
        };

        const productId = productData.id;
        const url = `${base_url}/wp-json/wc/v3/products/${productId}?consumer_key=${c_key}&consumer_secret=${c_secret}`;
        this.setState({ loading: true });
        fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProductObject),
        }).then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    error: responseJson.code || null,
                    loading: false,
                });
                if ("message" in responseJson)
                    ToastAndroid.show(`Product Not Updated. Code: ${responseJson.message}`, ToastAndroid.LONG);
                ToastAndroid.show('Product Updated', ToastAndroid.LONG);
            }).catch((error) => {
                this.setState({
                    error,
                    loading: false,
                })
            });
        GLOBAL.productdetailsScreen.fetchProductDetails()
        GLOBAL.productslistScreen.handleRefresh()
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
    sectionRow: {
        flex: 1,
        flexDirection: 'row',
        marginLeft: 10,
        marginRight: 10,
        alignItems: 'center',
        height: 35
    },
    sectionRowLeftCol: {
        flex: 2,
        justifyContent: 'center',
    },
    sectionRowRightCol: {
        flex: 2,
        justifyContent: 'center',
    }
});