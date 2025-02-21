import React, { useEffect, useState } from 'react';
import "./analytics.css"
import { Input } from 'antd';
import { Header } from 'antd/es/layout/layout';
import { getAnalyticsData } from '../OutReach/outreachService';
import NoDataUI from '../../components/NoData';
const { Search } = Input;

const Analytics = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [analyticsData, setAnalyticsData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAnalyticsData = async (search = '') => {
        try {
            setLoading(true);
            const data = await getAnalyticsData(search);
            setAnalyticsData(data);
        } catch (error) {
            console.error('Error fetching analytics data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    // Debounce search to avoid too many API calls
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchAnalyticsData(searchTerm);
        }, 500); // Wait for 500ms after last keystroke

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    return (
        <div className="analytics-container">
            <Header className="analytics-header">
                <div className="heading">
                    <h1>Analytics</h1>

                </div>
            </Header>
            <div className="global-search">
                <Search
                    allowClear
                    placeholder="Search by category, campaign, or region..."
                    value={ searchTerm }
                    onChange={ (e) => handleSearch(e.target.value) }
                    className="search-input"
                    loading={ loading }
                />
            </div>
            <div className="contact-table">
                { loading ? (
                    <div className="loading-state">Loading...</div>
                ) : !analyticsData || analyticsData.length === 0 ? (
                    <NoDataUI />
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Campaign Name</th>
                                <th>Region</th>
                                <th>Data</th>
                                <th>Total Touch</th>
                            </tr>
                        </thead>
                        <tbody>
                            { analyticsData.map((item, index) => (
                                <tr key={ index }>
                                    <td>{ item?.category }</td>
                                    <td>{ item?.campaign }</td>
                                    <td>{ item?.region }</td>
                                    <td>{ item?.totalData }</td>
                                    <td>{ item?.totalTouches }</td>
                                </tr>
                            )) }
                        </tbody>
                    </table>
                ) }
            </div>
        </div>
    );
};

export default Analytics;