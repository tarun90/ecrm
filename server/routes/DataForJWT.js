export const dataForJWT = async (userData) => {
      try {
        // console.log(userData, "userData");
        return {
          _id: userData._id,
          username: userData.username,
          email: userData.email,
          phone_number: userData.phone_number,
          login_alias: userData?.login_alias,
          first_name: userData?.first_name,
          last_name: userData?.last_name,
          password: userData?.password,
          role: userData.role_id,
          user_img: userData?.emp_img,
          designation: userData?.designation_id?.designation_name,
          isLeft: userData?.isLeft,
          enrollment_no: userData?.enrollment_no
        };
      } catch (error) {
        console.log("🚀 ~dataForJWT :  error:", error);
      }
    };

