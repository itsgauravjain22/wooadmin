import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
export default class ProductDetails extends Component {
    constructor(props) {
        super(props);
        this.state = { loading: false };
        productData = this.props.navigation.getParam('productData');
        base_url = this.props.navigation.getParam('base_url');
        c_key = this.props.navigation.getParam('c_key');
        c_secret = this.props.navigation.getParam('c_secret');
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.getParam('productName', 'Product'),
            headerStyle: {
                backgroundColor: '#96588a',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        };
    };

    getProductImages() {
        let productImagesData = [];
        productData.images.forEach(item => {
            productImagesData.push(
                <Image key={`image_${item.id}`} source={(item) ? { uri: item.src } : require('../../../assets/images/blank_product.png')}
                    onError={(e) => { this.props.source = require('../../../assets/images/blank_product.png') }}
                    style={{ width: 150, height: 150 }} resizeMode='contain' />
            )
        });
        return <ScrollView horizontal={true}>{productImagesData}</ScrollView>
    }

    //Get product categories data
    getProductCategories() {
        let productCategoriesData = [];
        productData.categories.forEach(item => {
            productCategoriesData.push(
                <View key={`category_${item.id}`} style={{ flexDirection: "row", margin: 10, backgroundColor: 'white' }}>
                    <Text>{item.name ? item.name : null}</Text>
                </View>
            )
        })
        return productCategoriesData;
    }

    //Get product attributes data
    getProductAttributes() {
        let productAttributesData = [];
        productData.attributes.forEach(item => {
            let attributesOptions = [];
            item.options.forEach((option, index) =>
                attributesOptions.push(
                    <View key={`attribute_${item.id}_option${index}`} style={{ flexDirection: "row", margin: 5, backgroundColor: 'white' }}>
                        <Text>{option}</Text>
                    </View>
                )
            )
            productAttributesData.push(
                <View key={`attribute_${item.id}`} style={{ marginTop: 10 }}>
                    <Text>{item.name}</Text>
                    <ScrollView horizontal={true}>
                        {attributesOptions}
                    </ScrollView>
                </View>
            )
        }
        )
        return productAttributesData;
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
            <View style={{ flex: 1 }}>
                <ScrollView style={{ flex: 1 }}>
                    <View style={{ height: 150 }}>
                        {this.getProductImages()}
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.titleText}>{productData.name}</Text>
                        <Text>Sku: {productData.sku}</Text>
                        <Text>Slug: {productData.slug}</Text>
                        <Text>Total Ordered: {productData.total_sales}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.titleText}>Pricing</Text>
                        <Text>Regular Price: {productData.regular_price}</Text>
                        <Text>Sale Price: {productData.sale_price}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.titleText}>Inventory</Text>
                        <Text>Stock Status: {productData.stock_status}</Text>
                        <Text>Manage Stock: {productData.manage_stock ? 'true' : 'false'}</Text>
                        <Text>Stock Qty: {productData.stock_quantity}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.titleText}>Shipping</Text>
                        <Text>Weight: {productData.weight}</Text>
                        <Text>Size: {productData.dimensions.length}x{productData.dimensions.width}x{productData.dimensions.height}</Text>
                        <Text>Stock Qty: {productData.stock_quantity}</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.titleText}>Categories</Text>
                        <ScrollView horizontal={true}>{this.getProductCategories()}</ScrollView>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.titleText}>Attributes</Text>
                        <>{this.getProductAttributes()}</>
                    </View>
                </ScrollView>
                <TouchableOpacity
                    style={{
                        borderWidth: 1,
                        borderColor: 'rgba(0,0,0,0.2)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        position: 'absolute',
                        bottom: 15,
                        right: 15,
                        backgroundColor: '#fff',
                        borderRadius: 100,
                    }}
                    onPress={() => {
                        this.props.navigation.navigate('EditProduct', {
                            productId: productData.id,
                            productName: productData.name,
                            productData: productData,
                            base_url: base_url,
                            c_key: c_key,
                            c_secret: c_secret
                        });
                    }}
                >
                    <Ionicons name="md-create" size={30} color="#96588a" />
                </TouchableOpacity>
            </View>
        );
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
