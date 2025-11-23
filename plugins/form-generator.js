import { useForm } from "vee-validate";
import { getCurrentInstance, h } from "vue";
import FormGenerator from "../components/form-generator.vue";

export default {
  install(app, library) {
    const DEFAULT_FORM_NAME = "form";

    const getParentScopeId = () => getCurrentInstance()?.vnode.scopeId;

    app.component("FormGenerator", {
      props: {
        name: {
          type: String,
          required: false,
          default: DEFAULT_FORM_NAME,
        },
        parentScopeId: {
          type: String,
          required: false,
        },
      },
      setup(props) {
        return () =>
          h(FormGenerator, {
            ...props,
            library,
            scopeId: getParentScopeId(),
          });
      },
    });

    window.useFormGenerator = useForm;
  },
};
