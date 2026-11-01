

const validLogin = (input) => {
    let errors = {};
  
    // Using Regular Expressions to validate the appropriate use
    const validEmail = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    const validPass = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    
    
    // Validaciones para el campo de email
    if (!input.email.trim()) {
      errors.email = "Este campo no puede estar vacio";
    } else if (!validEmail.test(input.email.trim())) {
      errors.email = "Formato de email invalido";
    } else if (input.email.length >= 50) {
      errors.email = "El email es muy largo";
    }
  
    // Validaciones para el campo de contraseña
    if (!input.password.trim()) {
      errors.password = "Este campo no puede estar vacio";
    } else if (!validPass.test(input.password.trim())) {
      errors.password = "La contrasena debe contener al menos una mayuscula y un numero";
    } else if (input.password.length < 8) {
      errors.password = "La contrasena debe tener al menos 8 caracteres";
    }
  
    return errors;
  };
  
  const ValidCreate = (input) => {
    
      let errors = {};
    
    
      const validEmail = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
      const validPass = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
      
      // Validaciones para el campo de email
      if (!input.email.trim()) {
        errors.email = "Este campo no puede estar vacio";
      } else if (!validEmail.test(input.email.trim())) {
        errors.email = "Formato de email invalido";
      } else if (input.email.length >= 50) {
        errors.email = "El email es muy largo";
      }
      return errors;
    };
  
  const ValidPass = (input)=>{
      let errors = {};
  
      const validatePassword = /^(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
     
      // Validaciones para el campo de contraseña
      if (!input.newPassword.trim()) {
        errors.newPassword = "Este campo no puede estar vacio";
      } else if (!validatePassword.test(input.newPassword.trim())) {
        errors.newPassword = "La contrasena debe contener al menos una mayuscula y un numero";
      } else if (input.newPassword.length < 8) {
        errors.newPassword = "La contrasena debe tener mas de 8 letras";
      } else if (input.newPassword !== input.confirmPassword) {
        errors.confirmPassword = "Las contrasenas no coinciden";
      }
      return errors;
  }
  const ValidContact = (input) => {
      let errors = {};
    
      // Using Regular Expressions to validate the appropriate use
      const validEmail = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
      
      // Validaciones para el campo de email
      if (!input.email.trim()) {
        errors.email = "Este campo no puede estar vacio";
      } else if (!validEmail.test(input.email.trim())) {
        errors.email = "Formato de email invalido";
      } else if (input.email.length >= 50) {
        errors.email = "El email es muy largo";
      }
       // Validaciones para el campo de issue
      if (!input.issue.trim()) {
        errors.issue = "Este campo no puede estar vacio";
      } else if (input.issue.length > 50) {
        errors.issue = "El asunto es muy largo";
      }
      //Validaciones para el campo del message
      if (!input.message.trim()) {
        errors.message = "Este campo no puede estar vacio";
      } else if (input.message.length < 50) {
        errors.message = "El mensaje es muy corto";
      }
      return errors;
    };
  export {
    validLogin,
    ValidCreate,
    ValidPass,
    ValidContact
  }; 
  