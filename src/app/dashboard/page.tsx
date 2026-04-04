"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ListOrdered,
  Edit3,
  UserCircle,
  LogOut,
  Package,
  Loader2,
  Landmark,
  CreditCard,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const bankSchema = z
  .object({
    accountHolderName: z.string().min(2, "Account holder name is required"),
    accountNumber: z
      .string()
      .min(9, "Account number must be at least 9 digits")
      .max(18, "Account number must be at most 18 digits")
      .regex(/^\d+$/, "Account number must contain only digits"),
    confirmAccountNumber: z
      .string()
      .min(1, "Please confirm your account number"),
    ifscCode: z.string(),
    accountType: z.enum(["savings", "current"], {
      required_error: "Please select an account type",
    }),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Account numbers do not match",
    path: ["confirmAccountNumber"],
  });

type BankFormValues = z.infer<typeof bankSchema>;

function AddBankAccountDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      accountHolderName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
      accountType: "savings",
    },
  });

  const onSubmit: SubmitHandler<BankFormValues> = async (data) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user-bank-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            account_holder_name: data.accountHolderName,
            account_number: data.accountNumber,
            ifsc_code: data.ifscCode,
            account_type: data.accountType,
          }),
        },
      );
      const result = await response.json();
      if (response.ok && result.status === 1) {
        toast({ title: result.message, variant: "success" });
        form.reset();
        onSuccess();
        onOpenChange(false);
      } else {
        toast({
          title: "Failed to save bank details",
          description: result.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "An Error Occurred",
        description: "Could not connect to the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Bank Account</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 pt-2"
          >
            <FormField
              control={form.control}
              name="accountHolderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Holder Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter account holder name"
                        {...field}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid sm:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Enter account number"
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmAccountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Account Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Re-enter account number"
                          {...field}
                          className="pl-10"
                          onPaste={(e) => e.preventDefault()}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="ifscCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IFSC Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. SBIN0001234"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="current">Current</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Account
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface User {
  name: string;
  email: string;
  type?: string;
}

interface BankAccount {
  id: string;
  is_default: boolean;
  created_at: string;
  bank_account: {
    ifsc: string;
    bank_name: string;
    name: string;
    account_number: string;
  };
}

function DashboardComponent() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isFetchingBankAccounts, setIsFetchingBankAccounts] = useState(false);
  const [isAddBankDialogOpen, setIsAddBankDialogOpen] = useState(false);

  useEffect(() => {
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      const parsedUser = JSON.parse(userDataString);
      setUser(parsedUser);
      if (parsedUser.type === "artist") {
        fetchBankAccounts();
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const fetchBankAccounts = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setIsFetchingBankAccounts(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user-bank-account`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json();
      if (response.ok && result.status === 1) {
        setBankAccounts(result.data);
      }
    } catch {
      toast({
        title: "Could not load bank accounts",
        variant: "destructive",
      });
    } finally {
      setIsFetchingBankAccounts(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");

    if (token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Logout API call failed:", error);
      }
    }

    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      variant: "success",
    });
    router.push("/login");
    router.refresh();
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const isArtist = user.type === "artist";

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="font-headline text-3xl sm:text-4xl font-semibold">
              Welcome, {user.name}!
            </h1>
            <p className="text-muted-foreground mt-1">{user.email}</p>
          </div>
          <Button
            variant="outline"
            className="mt-4 sm:mt-0"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Log Out
          </Button>
        </div>
      </section>

      <div
        className={`grid md:grid-cols-2 ${isArtist ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-6`}
      >
        {isArtist && (
          <Link href="/seller/my-artworks" passHref>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-medium font-headline">
                  My Artworks
                </CardTitle>
                <Package className="h-6 w-6 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage your artwork listings and inventory.
                </p>
              </CardContent>
            </Card>
          </Link>
        )}

        <Link href="/dashboard/order-history" passHref>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium font-headline">
                Order History
              </CardTitle>
              <ListOrdered className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View your past purchases and track current orders.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link
          href={
            isArtist ? "/seller/assigned-requests" : "/dashboard/my-requests"
          }
          passHref
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium font-headline">
                {isArtist ? "Assigned Requests" : "My Custom Art Requests"}
              </CardTitle>
              <Edit3 className="h-6 w-6 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {isArtist
                  ? "View and respond to custom art commissions."
                  : "Track the status of your custom art commissions."}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/profile" passHref>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium font-headline">
                Profile Settings
              </CardTitle>
              <UserCircle className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage your account details and preferences.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <AddBankAccountDialog
        open={isAddBankDialogOpen}
        onOpenChange={setIsAddBankDialogOpen}
        onSuccess={fetchBankAccounts}
      />

      {isArtist && (
        <section className="bg-card p-6 rounded-lg shadow">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <Landmark className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold font-headline">
                Bank Accounts
              </h2>
            </div>
            <Button size="sm" onClick={() => setIsAddBankDialogOpen(true)}>
              Add Bank Account
            </Button>
          </div>

          {isFetchingBankAccounts ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : bankAccounts.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No bank accounts added yet.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bankAccounts.map((account) => (
                <div
                  key={account.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{account.bank_account.bank_name}</p>
                    {account.is_default && (
                      <Badge variant="secondary" className="shrink-0">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="text-foreground font-medium">Account Holder: </span>
                      {account.bank_account.name}
                    </p>
                    <p>
                      <span className="text-foreground font-medium">Account No: </span>
                      {"•".repeat(account.bank_account.account_number.length - 4)}
                      {account.bank_account.account_number.slice(-4)}
                    </p>
                    <p>
                      <span className="text-foreground font-medium">IFSC: </span>
                      {account.bank_account.ifsc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <DashboardComponent />
    </Suspense>
  );
}
