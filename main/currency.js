export const getCurrency = async () => {
  const headers = new Headers();
  headers.append("apikey", "b060c1df12ab42f497c663ddbdc906b1");

  const option = {
    method: "GET",
    redirect: "follow",
  };

  const result = await fetch(
    "https://openexchangerates.org/api/latest.json?app_id=b060c1df12ab42f497c663ddbdc906b1&base=USD",
    option
  );
  if (!result.ok) {
    throw new Error("cannot fetch currency data");
  }
  return result.json();
};

export const getSalary = (amountUSD, currency, currencyData) => {
  const amount =
    currency === "USD" ? amountUSD : amountUSD * currencyData.rates[currency];

  const formatter = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  });
  return formatter.format(amount);
};
