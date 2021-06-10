const routes = [
  {
    name: "District Dashboard",
    routes: [
      {
        path: "/district/capacity",
        name: "Capacity",
      },
      {
        path: "/district/patient",
        name: "Patient",
      },
      {
        path: "/district/tests",
        name: "Tests",
      },
      {
        path: "/district/covid",
        name: "Covid",
      },
      {
        path: "/district/oxygen",
        name: "Oxygen",
      },
    ],
  },
  {
    href: "https://care.mahakavach.in/",
    name: "Mahakavach login",
  },
  {
    href: "https://www.covid19maharashtragov.in/mh-covid/dashboard",
    name: "Mahrashtra State COVID -19 Dashboard",
  },
];

export default routes;
