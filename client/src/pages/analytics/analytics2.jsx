import React, { useEffect, useState } from 'react';
import "./analytics.css"
import { Input } from 'antd';
import { Header } from 'antd/es/layout/layout';
import { getUserCampaignData } from '../OutReach/outreachService';
import NoDataUI from '../../components/NoData';
const { Search } = Input;

const Analytics2 = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [analyticsData, setAnalyticsData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAnalyticsData = async (search = '') => {
        try {
            setLoading(true);
            const data = await getUserCampaignData(search);
            setAnalyticsData(data);
        } catch (error) {
            console.error('Error fetching user campaign data:', error);
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
                <div className="search-container">
                    <h1>Analytics2</h1>
                    <Search
                        allowClear
                        placeholder="Search by user or campaign..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="search-input"
                        loading={loading}
                    />
                </div>
                <div className="action-buttons">
                    {/* Action buttons can be added here */}
                </div>
            </Header>
            <div className="contact-table">
                {loading ? (
                    <div className="loading-state">Loading...</div>
                ) : !analyticsData || analyticsData.length === 0 ? (
                    <NoDataUI />
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Campaign Name</th>
                                <th>Outreach Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analyticsData.map((item, index) => (
                                <tr key={index}>
                                    <td>{item?.userName}</td>
                                    <td>{item?.campaignName}</td>
                                    <td>{item?.totalOutreach}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Analytics2;