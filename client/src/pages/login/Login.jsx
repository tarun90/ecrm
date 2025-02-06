import { Form, Input, Button, Card, message, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Login.module.css';
import './Login.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import LogoIcon from '../assets/Icons/LogoIcon';
function Login() {
  const navigate = useNavigate();
  const { login, authenticatedData } = useAuth();
  const [form] = Form.useForm();
  const [isRegister, setIsRegister] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  console.log(token, "ketul token")
  useEffect(() => {
    if (token) {
      ssoLoginApi(token);
    }
  }, []);
  const handleSSO = () => {
    const originalUrl = `http://localhost:5173/login`;
    const encodedUrl = encodeURIComponent(originalUrl);
    window.open(
      `http://hrms.elsner.com/signin?redirect_uri=${encodedUrl}`,
      "_self"
    );

  };

  const ssoLoginApi = async (token) => {
    const body = {
      tokenData: token
    }
    await axios.post(
      'http://localhost:5000/api/auth/redirectToBack',
      body,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).then(async (response) => {
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      authenticatedData(user, token)

      navigate('/');

    });
    // const response = await axios.post(`${API_BASE_URL}/auth/redirectToBack`, values, {
    //   headers: {
    //     'Content-Type': 'application/json', // Ensure JSON request
    //   },

    // });
    // const reqBody = {
    //   token: token
    // };
    // dispatch(setLoading(true));
    // try {
    //   const response = await Service.makeAPICall({
    //     methodName: Service.postMethod,
    //     api_url: `${Service.ssoLoginApi}`,
    //     body: reqBody,
    //   });
    //   manageResponseForLogin(response)
    // } catch (error) {
    //   // dispatch(hideAuthLoader());
    //   dispatch(setLoading(false));
    //   console.log(error);
    // }
  }

  const onFinish = async (values) => {
    try {
      if (isRegister) {
        await axios.post('http://localhost:5000/api/auth/register', values);
        message.success('Registration successful! Please login.');
        setIsRegister(false);
        form.resetFields();
        return;
      }
      await login(values);
      navigate('/');
    } catch (error) {
      console.log("🚀 ~ onFinish ~ error:", error)
      message.error(isRegister ? 'Registration failed.' : 'Login failed. Please check your credentials.');
    }
  };

  return (
    <Row className='main-login-page-wrapper'>
      <Col span={ 12 } className="min-logo-wrapper">
        <div className="login-page-logo">
          <LogoIcon />
        </div>
      </Col>
      <Col span={ 12 } className="login-min-wrapper">
        <Card title="Sign In" className={ styles.loginCard }>
          <Form
            form={ form }
            name="login"
            onFinish={ onFinish }
            autoComplete="off"
          >
            { isRegister && (
              <Form.Item
                name="name"
                rules={ [{ required: true, message: 'Please input your name!' }] }
              >
                <Input prefix={ <UserOutlined /> } placeholder="Full Name" />
              </Form.Item>
            ) }

            <Form.Item
              name="email"
              rules={ [
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ] }
            >
              <Input prefix={ <UserOutlined /> } placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={ [{ required: true, message: 'Please input your password!' }] }
            >
              <Input.Password prefix={ <LockOutlined /> } placeholder="Password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                { isRegister ? 'Register' : 'Log in' }
              </Button>
            </Form.Item>
            { !isRegister &&
              <Form.Item>
                <Button type="primary" block onClick={ () => {
                  handleSSO();
                } }>
                  Sign in with HRMS
                </Button>
              </Form.Item>
            }

            {/* <Button type="link" block onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
          </Button> */}
          </Form>
        </Card>
      </Col>
    </Row>
  );
}

export default Login;